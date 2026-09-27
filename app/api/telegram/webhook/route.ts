import { NextResponse } from "next/server"
import {
  telegramApi,
  telegramWebhookSecret,
  sendTelegramMessage,
  sendTelegramPhoto,
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  isTelegramConfigured,
  getBotMe,
} from "@/lib/telegram"
import { movies, genres, getMovie, getFeatured, byGenre } from "@/lib/movies"
import { getAllMedia, getMediaById } from "@/lib/anime-store"
import { getSponsorChannels, checkChannelSubscription } from "@/lib/admin-store"
import { generateAdminSignature } from "@/lib/admin-auth"
import { parseTelegramMediaPost, saveMediaDraft, getMediaDraft, deleteMediaDraft } from "@/lib/media-parser"
import { addMediaItem } from "@/lib/anime-store"
import {
  getActiveSessionForUser,
  updateUploadSession,
  setActiveSessionForUser,
} from "@/lib/telegram-upload-sync"

type TelegramChat = { id: number | string; first_name?: string; username?: string; type?: string }
type TelegramUser = { id: number; first_name: string; username?: string }
type TelegramPhoto = { file_id: string; width: number; height: number }
type TelegramVideo = { file_id: string; duration: number; file_name?: string }
type TelegramDocument = { file_id: string; file_name?: string; mime_type?: string }

type TelegramMessage = {
  message_id: number
  chat: TelegramChat
  from?: TelegramUser
  text?: string
  caption?: string
  video?: TelegramVideo
  photo?: TelegramPhoto[]
  document?: TelegramDocument
  forward_from?: TelegramUser
  forward_from_chat?: { id: number; title?: string; username?: string; type: string }
}

type TelegramCallbackQuery = {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

type TelegramInlineQuery = {
  id: string
  from: TelegramUser
  query: string
  offset: string
}

type TelegramUpdate = {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
  inline_query?: TelegramInlineQuery
}

// Helper to determine the site base URL dynamically
function getSiteUrl(request?: Request): string {
  if (request) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
    const proto = request.headers.get("x-forwarded-proto") || "https"
    if (host) return `${proto}://${host}`
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return "https://ais-dev-uutxhduathfxogfs6ag5we-30790122823.asia-east1.run.app"
}

// Generate movie poster absolute URL
function getPosterUrl(siteUrl: string, posterPath: string): string {
  if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
    return posterPath
  }
  return `${siteUrl}${posterPath.startsWith("/") ? "" : "/"}${posterPath}`
}

// Format movie card text with HTML
function formatMovieCard(movie: (typeof movies)[0]): string {
  return [
    `🎬 <b>${movie.title}</b> (${movie.year})`,
    ``,
    `⭐ <b>Reyting:</b> ${movie.rating.toFixed(1)} / 10`,
    `🎞️ <b>Sifat:</b> ${movie.quality} Ultra HD`,
    `⏳ <b>Davomiyligi:</b> ${movie.duration}`,
    `🔞 <b>Yosh chegarasi:</b> ${movie.ageRating}`,
    `🎭 <b>Janrlar:</b> ${movie.genres.join(", ")}`,
    `👤 <b>Rejissyor:</b> ${movie.director}`,
    `👥 <b>Rollarda:</b> ${movie.cast.join(", ")}`,
    ``,
    `📝 <b>Tavsif:</b>`,
    `${movie.synopsis}`,
    ``,
    `🍿 <i>OneMedia — Sevimli kinolaringiz bir joyda!</i>`,
  ].join("\n")
}

// Generate movie inline keyboard
function getMovieInlineKeyboard(siteUrl: string, movie: (typeof movies)[0]) {
  const filmUrl = `${siteUrl}/film/${movie.id}`
  const shareText = encodeURIComponent(`OneMedia kino portalida «${movie.title}» (${movie.year}) filmini tomosha qiling!\n⭐ Reyting: ${movie.rating}/10`)
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(filmUrl)}&text=${shareText}`

  return {
    inline_keyboard: [
      [
        { text: "▶️ Onlayn ko'rish (Web)", web_app: { url: filmUrl } },
        { text: "🌐 Saytda ochish", url: filmUrl },
      ],
      [
        { text: "📥 Yuklab olish", callback_data: `dl:${movie.id}` },
        { text: "⭐ Sevimlilarga", callback_data: `fav:${movie.id}` },
      ],
      [
        { text: "🔗 Do'stlarga ulashish", url: shareUrl },
      ],
      [
        { text: "🔍 Boshqa kinolar", callback_data: "menu:search" },
        { text: "🏠 Bosh menyu", callback_data: "menu:main" },
      ],
    ],
  }
}

// Main persistent reply keyboard
function getMainMenuReplyKeyboard(siteUrl: string) {
  return {
    keyboard: [
      [{ text: "🎬 Kino izlash" }, { text: "🔥 Mashhur kinolar" }],
      [{ text: "🆕 Yangi filmlar" }, { text: "🌟 Top kinolar" }],
      [{ text: "🎭 Janrlar" }, { text: "📺 Seriallar & Multfilmlar" }],
      [{ text: "🌐 OneMedia Sayti (WebApp)" }, { text: "⭐ Sevimlilar" }],
      [{ text: "📥 Yuklab olish" }, { text: "ℹ️ Yordam" }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  }
}

// Send main menu welcome
async function sendMainMenu(chatId: number | string, firstName = "do‘st", siteUrl: string) {
  const text = [
    `Assalomu alaykum, <b>${firstName}</b>! 👋`,
    ``,
    `🍿 <b>OneMedia</b> rasmiy kino botiga xush kelibsiz!`,
    ``,
    `Bu yerda siz eng sara filmlar, premyeralar, seriallar va multfilmlarni <b>4K va Full HD</b> sifatda tomosha qilishingiz yoki yuklab olishingiz mumkin.`,
    ``,
    `🔍 <i>Film qidirish uchun uning nomini yozib yuboring yoki quyidagi menyudan foydalaning:</i>`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🍿 OneMedia WebApp (Kino Portali)", web_app: { url: siteUrl } },
        ],
        [
          { text: "🔥 Trend kinolar", callback_data: "menu:trending" },
          { text: "🌟 Top reyting", callback_data: "menu:top" },
        ],
        [
          { text: "🎭 Janrlar bo'yicha", callback_data: "menu:genres" },
          { text: "🔍 Qidiruv", callback_data: "menu:search" },
        ],
      ],
    },
  })

  // Also ensure reply keyboard is active
  await sendTelegramMessage(chatId, "Quyidagi tugmalar orqali bo'limni tanlang:", {
    reply_markup: getMainMenuReplyKeyboard(siteUrl),
  })
}

// Send list of trending movies
async function sendTrendingMovies(chatId: number | string, siteUrl: string) {
  const trending = getFeatured()
  const buttons = trending.map((m) => [
    { text: `🎬 ${m.title} (${m.year}) — ⭐ ${m.rating}`, callback_data: `movie:${m.id}` },
  ])

  buttons.push([
    { text: "🌐 Saytda barchasini ko'rish", web_app: { url: `${siteUrl}/catalog` } },
  ])

  const text = [
    `🔥 <b>Hozirda trendda bo'lgan eng mashhur kinolar:</b>`,
    ``,
    `Batafsil ma'lumot va tomosha qilish uchun istalgan filmni tanlang:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Send list of latest movies
async function sendNewMovies(chatId: number | string, siteUrl: string) {
  const newMovies = movies.filter((m) => m.year >= 2025).slice(0, 8)
  const buttons = newMovies.map((m) => [
    { text: `🆕 ${m.title} — ${m.quality} [${m.genres[0] || ""}]`, callback_data: `movie:${m.id}` },
  ])

  buttons.push([
    { text: "🌐 Barcha premyeralar (WebApp)", web_app: { url: `${siteUrl}/catalog` } },
  ])

  const text = [
    `🆕 <b>2025-yilgi yangi kinolar va premyeralar:</b>`,
    ``,
    `Filmni tanlang va 4K sifatda tomosha qiling:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Send top rated movies
async function sendTopMovies(chatId: number | string, siteUrl: string) {
  const topMovies = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8)
  const buttons = topMovies.map((m, index) => [
    { text: `${index + 1}. ⭐ ${m.rating} — ${m.title} (${m.year})`, callback_data: `movie:${m.id}` },
  ])

  buttons.push([
    { text: "🌐 Barcha reytinglar", web_app: { url: `${siteUrl}/catalog` } },
  ])

  const text = [
    `🌟 <b>Eng yuqori baholangan TOP filmlar:</b>`,
    ``,
    `Tomoshabinlar va kinotanqidchilar tomonidan eng yuqori baholangan asarlar:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Send list of genres
async function sendGenresMenu(chatId: number | string) {
  const realGenres = genres.filter((g) => g !== "Barchasi")
  const buttons: { text: string; callback_data: string }[][] = []

  const emojiMap: Record<string, string> = {
    Fantastika: "🚀",
    Jangari: "💥",
    Drama: "🎭",
    Triller: "😱",
    Melodrama: "💕",
    Sarguzasht: "🗺️",
    Multfilm: "🧸",
    Detektiv: "🕵️",
  }

  for (let i = 0; i < realGenres.length; i += 2) {
    const row = []
    const g1 = realGenres[i]
    row.push({ text: `${emojiMap[g1] || "🎬"} ${g1}`, callback_data: `genre:${g1}` })
    if (i + 1 < realGenres.length) {
      const g2 = realGenres[i + 1]
      row.push({ text: `${emojiMap[g2] || "🎬"} ${g2}`, callback_data: `genre:${g2}` })
    }
    buttons.push(row)
  }

  buttons.push([{ text: "🏠 Bosh menyu", callback_data: "menu:main" }])

  const text = [
    `🎭 <b>Kinolar janrlar bo'yicha:</b>`,
    ``,
    `Qaysi janrdagi kinolarni ko'rishni xohlaysiz? Kerakli janrni bosing:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Send movies for a specific genre
async function sendGenreMovies(chatId: number | string, genreName: string, siteUrl: string) {
  const genreList = byGenre(genreName)
  if (genreList.length === 0) {
    await sendTelegramMessage(chatId, `🎭 <b>${genreName}</b> janrida hozircha filmlar yo'q.`, {
      reply_markup: {
        inline_keyboard: [[{ text: "🎭 Boshqa janrlar", callback_data: "menu:genres" }]],
      },
    })
    return
  }

  const buttons = genreList.map((m) => [
    { text: `🎬 ${m.title} (${m.year}) — ⭐ ${m.rating}`, callback_data: `movie:${m.id}` },
  ])
  buttons.push([
    { text: "🎭 Boshqa janrlar", callback_data: "menu:genres" },
    { text: "🏠 Bosh menyu", callback_data: "menu:main" },
  ])

  const text = [
    `🎭 <b>${genreName}</b> janridagi filmlar (${genreList.length} ta):`,
    ``,
    `Ko'rmoqchi bo'lgan filmingizni tanlang:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Send animations and family movies
async function sendSeriesAndCartoons(chatId: number | string, siteUrl: string) {
  const familyMovies = movies.filter((m) => m.genres.includes("Multfilm") || m.genres.includes("Oila") || m.ageRating === "0+" || m.ageRating === "6+")
  const buttons = familyMovies.map((m) => [
    { text: `🧸 ${m.title} (${m.year}) — ⭐ ${m.rating}`, callback_data: `movie:${m.id}` },
  ])

  buttons.push([
    { text: "🌐 Bolalar bo'limi (WebApp)", web_app: { url: `${siteUrl}/catalog` } },
  ])

  const text = [
    `📺 <b>Seriallar, Multfilmlar va Bolalar uchun:</b>`,
    ``,
    `Oilaviy va bolalar uchun qiziqarli multfilmlar ro'yxati:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Check mandatory sponsor subscriptions
async function verifyUserSubscription(chatId: number | string): Promise<{ subscribed: boolean; unjoinedChannel?: string; inviteLink?: string; channelTitle?: string }> {
  const sponsors = getSponsorChannels().filter((s) => s.required)
  for (const sp of sponsors) {
    const isSub = await checkChannelSubscription(sp.username, chatId)
    if (!isSub) {
      return {
        subscribed: false,
        unjoinedChannel: sp.username,
        inviteLink: sp.inviteLink,
        channelTitle: sp.title,
      }
    }
  }
  return { subscribed: true }
}

// Send Admin Panel
async function sendAdminPanel(chatId: number | string, firstName = "Admin", siteUrl: string) {
  let webhookInfo: { url: string; pending_update_count: number; last_error_message?: string } | null = null
  try {
    webhookInfo = await telegramApi<{ url: string; pending_update_count: number; last_error_message?: string }>("getWebhookInfo")
  } catch {
    // ignore
  }

  const allMedia = getAllMedia()
  const animeCount = allMedia.filter((m) => m.type === "anime").length

  const text = [
    `👑 <b>OneMedia — Admin Boshqaruv Markazi</b>`,
    ``,
    `Assalomu alaykum, <b>${firstName}</b>!`,
    ``,
    `📊 <b>Jonli statistika:</b>`,
    `• 🎬 Filmlar & Animelar: <b>${allMedia.length} ta</b> (${animeCount} ta anime)`,
    `• 🤖 Bot: <b>@onemediahd_bot</b>`,
    `• 🌐 Asosiy domen: <code>onemedia-mocha.vercel.app</code>`,
    `• 📡 Webhook: <b>${webhookInfo?.url ? "🟢 Ulangan" : "🟡 Ulanmagan"}</b>`,
    `• ⏳ Kutilayotgan so'rovlar: <b>${webhookInfo?.pending_update_count ?? 0} ta</b>`,
    ``,
    `🔐 <i>Havolalar SHA-256 xavfsizlik imzosi bilan himoyalangan.</i>`,
  ].join("\n")

  const ts = Date.now()
  const sig = generateAdminSignature(String(chatId), ts, "super_admin")
  const signedTgUrl = `${siteUrl}/api/auth/admin-verify?uid=${chatId}&ts=${ts}&sig=${sig}&target=tg`
  const signedWebUrl = `${siteUrl}/api/auth/admin-verify?uid=${chatId}&ts=${ts}&sig=${sig}&target=web`

  const buttons = [
    [
      { text: "📱 Telegram Admin Panel (Mini App)", web_app: { url: signedTgUrl } },
    ],
    [
      { text: "💻 Web Studio (To'liq Dashboard)", url: signedWebUrl },
      { text: "⚙️ Webhook sozlamalari", url: `${siteUrl}/api/telegram/setup` },
    ],
    [
      { text: "🎬 Barcha kinolar & Anime ro'yxati", callback_data: "admin:movies_list" },
    ],
    [
      { text: "🔄 Webhookni tekshirish", callback_data: "admin:check_webhook" },
      { text: "📢 Kanalga ulashish (Inline)", callback_data: "admin:broadcast_info" },
    ],
    [
      { text: "🏠 Foydalanuvchi menyusi", callback_data: "menu:main" },
    ],
  ]

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Send a single movie card
async function sendMovieCard(chatId: number | string, movieId: string, siteUrl: string, skipSubCheck = false) {
  if (!skipSubCheck) {
    const subCheck = await verifyUserSubscription(chatId)
    if (!subCheck.subscribed) {
      const text = [
        `⚠️ <b>Filmni 4K sifatda tomosha qilish uchun homiy kanalimizga a'zo bo'ling:</b>`,
        ``,
        `📢 Kanal: <b>${subCheck.channelTitle || subCheck.unjoinedChannel}</b>`,
        ``,
        `Kanalga a'zo bo'lib, quyidagi <b>«✅ A'zo bo'ldim (Tekshirish)»</b> tugmasini bosing:`,
      ].join("\n")

      await sendTelegramMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: `📢 ${subCheck.channelTitle || "Kanalga a'zo bo'lish"}`, url: subCheck.inviteLink || `https://t.me/${subCheck.unjoinedChannel?.replace("@", "")}` }],
            [{ text: "✅ A'zo bo'ldim (Tekshirish)", callback_data: `check_sub:${movieId}` }],
          ],
        },
      })
      return
    }
  }

  const movie = getMediaById(movieId) || getMovie(movieId)
  if (!movie) {
    await sendTelegramMessage(chatId, "Kechirasiz, ushbu film yoki anime topilmadi.")
    return
  }

  const caption = formatMovieCard(movie as any)
  const posterUrl = getPosterUrl(siteUrl, movie.poster)
  const keyboard = getMovieInlineKeyboard(siteUrl, movie as any)

  await sendTelegramPhoto(chatId, posterUrl, caption, {
    reply_markup: keyboard,
  })
}

// Search movies by query
async function handleSearch(chatId: number | string, query: string, siteUrl: string) {
  const clean = query.trim().toLowerCase()
  if (!clean) return

  // Check if query is a movie number (e.g. 1, 2, #1, ...)
  const numMatch = clean.replace("#", "").trim()
  const numIndex = parseInt(numMatch, 10)
  if (!isNaN(numIndex) && numIndex >= 1 && numIndex <= movies.length) {
    const movie = movies[numIndex - 1]
    await sendMovieCard(chatId, movie.id, siteUrl)
    return
  }

  // Filter movies matching title, genre, director, cast, or synopsis
  const matches = movies.filter((m) => {
    return (
      m.title.toLowerCase().includes(clean) ||
      m.id.toLowerCase().includes(clean) ||
      m.genres.some((g) => g.toLowerCase().includes(clean)) ||
      m.director.toLowerCase().includes(clean) ||
      m.cast.some((c) => c.toLowerCase().includes(clean)) ||
      m.synopsis.toLowerCase().includes(clean)
    )
  })

  if (matches.length === 0) {
    const suggestions = getFeatured().slice(0, 4)
    const buttons = suggestions.map((m) => [
      { text: `🎬 ${m.title} (${m.year})`, callback_data: `movie:${m.id}` },
    ])
    buttons.push([{ text: "🌐 Katalogda qidirish", web_app: { url: `${siteUrl}/search?q=${encodeURIComponent(query)}` } }])

    const text = [
      `❌ <b>"${query}"</b> bo'yicha hech qanday film topilmadi.`,
      ``,
      `Iltimos, nomni to'g'ri yozganingizni tekshiring yoki quyidagi ommabop filmlardan birini tanlang:`,
    ].join("\n")

    await sendTelegramMessage(chatId, text, {
      reply_markup: { inline_keyboard: buttons },
    })
    return
  }

  if (matches.length === 1) {
    await sendMovieCard(chatId, matches[0].id, siteUrl)
    return
  }

  // Multiple matches
  const buttons = matches.slice(0, 8).map((m) => [
    { text: `🎬 ${m.title} (${m.year}) — ⭐ ${m.rating}`, callback_data: `movie:${m.id}` },
  ])
  buttons.push([
    { text: `🌐 WebApp orqali ko'rish (${matches.length} ta)`, web_app: { url: `${siteUrl}/search?q=${encodeURIComponent(query)}` } },
  ])

  const text = [
    `🔍 <b>"${query}"</b> so'rovi bo'yicha <b>${matches.length}</b> ta film topildi:`,
    ``,
    `Ko'rmoqchi bo'lgan filmingizni bosing:`,
  ].join("\n")

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  })
}

// Handle all incoming Telegram updates
async function handleUpdate(update: TelegramUpdate, siteUrl: string) {
  // 1. Handle Inline Queries
  if (update.inline_query) {
    const iq = update.inline_query
    const query = iq.query.trim().toLowerCase()
    const matches = query
      ? movies.filter((m) => m.title.toLowerCase().includes(query) || m.genres.some((g) => g.toLowerCase().includes(query)))
      : movies.slice(0, 10)

    const results = matches.slice(0, 15).map((m) => ({
      type: "article",
      id: m.id,
      title: `${m.title} (${m.year}) ⭐ ${m.rating}`,
      description: `${m.genres.join(", ")} • ${m.quality} • ${m.duration}`,
      thumb_url: getPosterUrl(siteUrl, m.poster),
      input_message_content: {
        message_text: formatMovieCard(m),
        parse_mode: "HTML",
      },
      reply_markup: getMovieInlineKeyboard(siteUrl, m),
    }))

    await telegramApi("answerInlineQuery", {
      inline_query_id: iq.id,
      results,
      cache_time: 10,
    }).catch(() => null)
    return
  }

  // 2. Handle Callback Queries
  if (update.callback_query) {
    const cb = update.callback_query
    const data = cb.data || ""
    const chatId = cb.message?.chat.id || cb.from.id

    if (data.startsWith("movie:")) {
      const movieId = data.replace("movie:", "")
      await answerTelegramCallbackQuery(cb.id)
      await sendMovieCard(chatId, movieId, siteUrl)
      return
    }

    if (data.startsWith("genre:")) {
      const genreName = data.replace("genre:", "")
      await answerTelegramCallbackQuery(cb.id, `Janr: ${genreName}`)
      await sendGenreMovies(chatId, genreName, siteUrl)
      return
    }

    if (data.startsWith("dl:")) {
      const movieId = data.replace("dl:", "")
      const movie = getMovie(movieId)
      await answerTelegramCallbackQuery(cb.id, "Yuklab olish havolalari tayyorlanmoqda...")
      const filmUrl = `${siteUrl}/film/${movieId}`
      const text = [
        `📥 <b>«${movie?.title || "Film"}» ni yuklab olish:</b>`,
        ``,
        `Tanlang:`,
        `• <b>4K Ultra HD (6.2 GB)</b> — Maksimal sifat`,
        `• <b>Full HD 1080p (2.8 GB)</b> — Optimal sifat`,
        `• <b>HD 720p (1.2 GB)</b> — Smartfonlar uchun`,
        ``,
        `Filmni to'g'ridan-to'g'ri saytda ham tomosha qilishingiz mumkin!`,
      ].join("\n")

      await sendTelegramMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "▶️ Onlayn pleyerda ochish", web_app: { url: filmUrl } }],
            [{ text: "⬅️ Film sahifasiga qaytish", callback_data: `movie:${movieId}` }],
          ],
        },
      })
      return
    }

    if (data.startsWith("fav:")) {
      const movieId = data.replace("fav:", "")
      const movie = getMovie(movieId)
      await answerTelegramCallbackQuery(cb.id, `⭐ «${movie?.title}» sevimlilarga qo'shildi!`, true)
      return
    }

    if (data.startsWith("check_sub:")) {
      const movieId = data.replace("check_sub:", "")
      const subCheck = await verifyUserSubscription(chatId)
      if (!subCheck.subscribed) {
        await answerTelegramCallbackQuery(cb.id, "⚠️ Siz hali kanalga a'zo bo'lmadingiz! Iltimos, a'zo bo'ling.", true)
        return
      }
      await answerTelegramCallbackQuery(cb.id, "✅ Rahmat! Obuna tasdiqlandi.", false)
      await sendMovieCard(chatId, movieId, siteUrl, true)
      return
    }

    if (data === "menu:main") {
      await answerTelegramCallbackQuery(cb.id)
      await sendMainMenu(chatId, cb.from.first_name, siteUrl)
      return
    }

    if (data === "menu:genres") {
      await answerTelegramCallbackQuery(cb.id)
      await sendGenresMenu(chatId)
      return
    }

    if (data === "menu:trending") {
      await answerTelegramCallbackQuery(cb.id)
      await sendTrendingMovies(chatId, siteUrl)
      return
    }

    if (data === "menu:top") {
      await answerTelegramCallbackQuery(cb.id)
      await sendTopMovies(chatId, siteUrl)
      return
    }

    if (data === "menu:search") {
      await answerTelegramCallbackQuery(cb.id)
      await sendTelegramMessage(chatId, "🔍 Film nomini yoki kalit so'zni yuboring (masalan: <i>Nebula, Tuman, Bo'ron</i>):")
      return
    }

    if (data === "admin:panel") {
      await answerTelegramCallbackQuery(cb.id)
      await sendAdminPanel(chatId, cb.from.first_name, siteUrl)
      return
    }

    if (data === "admin:movies_list") {
      await answerTelegramCallbackQuery(cb.id)
      const listText = [
        `🎬 <b>OneMedia filmlar bazasi (${movies.length} ta film):</b>`,
        ``,
        ...movies.map((m, i) => `${i + 1}. <b>${m.title}</b> (${m.year}) — ⭐ ${m.rating} [${m.quality}]`),
        ``,
        `<i>Filmni ko'rish uchun quyidagi tugmalardan birini bosing:</i>`,
      ].join("\n")

      const movieBtns = movies.slice(0, 8).map((m, idx) => [
        { text: `${idx + 1}. ${m.title}`, callback_data: `movie:${m.id}` },
      ])
      movieBtns.push([{ text: "⬅️ Admin panelga qaytish", callback_data: "admin:panel" }])

      await sendTelegramMessage(chatId, listText, {
        reply_markup: { inline_keyboard: movieBtns },
      })
      return
    }

    if (data === "admin:check_webhook") {
      const wh = await telegramApi<{ url: string; pending_update_count: number; last_error_message?: string }>("getWebhookInfo").catch(() => null)
      await answerTelegramCallbackQuery(cb.id, "Webhook tekshirildi!", true)
      await sendTelegramMessage(
        chatId,
        `📡 <b>Webhook holati:</b>\n\n• URL: <code>${wh?.url || "Yo'q"}</code>\n• Kutilayotgan so'rovlar: <b>${wh?.pending_update_count ?? 0} ta</b>\n${wh?.last_error_message ? `• ⚠️ Xatolik: ${wh.last_error_message}` : "• Holati: Alo darajada ishlayapti ✅"}`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Admin panel", callback_data: "admin:panel" }]],
          },
        }
      )
      return
    }

    if (data === "admin:broadcast_info") {
      await answerTelegramCallbackQuery(cb.id)
      await sendTelegramMessage(
        chatId,
        `📢 <b>Kanal va guruhlarga film ulashish:</b>\n\nBotingiz Inline Mode qo'llab-quvvatlaydi!\nIstalgan Telegram chatida shunchaki:\n<code>@onemediahd_bot film_nomi</code>\ndeb yozing. Bot kino kartasini chiqarib beradi va uni bitta bosishda kanalga yuborishingiz mumkin!`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Admin panel", callback_data: "admin:panel" }]],
          },
        }
      )
      return
    }

    if (data.startsWith("draft:save:")) {
      const parts = data.split(":")
      const mediaType = parts[2] as "movie" | "anime"
      const draftId = parts[3]
      const draft = getMediaDraft(draftId)

      if (!draft) {
        await answerTelegramCallbackQuery(cb.id, "⚠️ Qoralama topilmadi yoki muddati o'tgan.", true)
        return
      }

      const newMedia = addMediaItem({
        title: draft.title,
        type: mediaType,
        year: draft.year,
        rating: draft.rating,
        duration: draft.duration,
        ageRating: "16+",
        genres: draft.genres,
        poster: "/images/poster-1.png",
        backdrop: "/images/hero-1.png",
        synopsis: draft.synopsis,
        director: "OneMedia Studio",
        cast: ["OneMedia Ijodiy Guruhi"],
        quality: draft.quality,
        featured: true,
        totalEpisodes: mediaType === "anime" ? (draft.totalEpisodes || 12) : 1,
        episodes: [
          {
            id: `${draftId}-ep1`,
            episodeNumber: 1,
            title: mediaType === "anime" ? "1-qism" : "To'liq film",
            duration: draft.duration,
            quality: draft.quality === "4K" ? "4K" : "1080p",
            telegramFileId: draft.fileId,
          },
        ],
      })

      deleteMediaDraft(draftId)
      await answerTelegramCallbackQuery(cb.id, `✅ «${draft.title}» bazaga qo'shildi!`, false)

      if (cb.message) {
        await editTelegramMessageText(
          chatId,
          cb.message.message_id,
          `🎉 <b>«${newMedia.title}» muvaffaqiyatli bazaga qo'shildi!</b>\n\n• Turi: <b>${mediaType === "anime" ? "Anime" : "Film"}</b>\n• Sifati: <b>${newMedia.quality}</b>\n• File ID: <code>${draft.fileId || "Mavjud"}</code>\n\nEndi bot va saytda tomosha qilish mumkin.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🎬 Kinoni ochish", callback_data: `movie:${newMedia.id}` }],
                [{ text: "👑 Admin panel", callback_data: "admin:panel" }],
              ],
            },
          }
        )
      }
      return
    }

    if (data.startsWith("draft:cancel:")) {
      const draftId = data.replace("draft:cancel:", "")
      deleteMediaDraft(draftId)
      await answerTelegramCallbackQuery(cb.id, "Bekor qilindi", false)
      if (cb.message) {
        await editTelegramMessageText(chatId, cb.message.message_id, "❌ Postni bazaga qo'shish bekor qilindi.")
      }
      return
    }

    await answerTelegramCallbackQuery(cb.id)
    return
  }

  // 3. Handle Regular Messages & Forwarded Media
  const message = update.message
  if (!message) return

  const chatId = message.chat.id
  const firstName = message.from?.first_name || "do‘st"

  // Check incoming video, photo, document, or forwarded post
  const videoFileId = message.video?.file_id
  const docFileId = message.document?.file_id
  const photoFileId = message.photo && message.photo.length > 0 ? message.photo[message.photo.length - 1].file_id : undefined
  const detectedMediaFileId = videoFileId || docFileId || photoFileId
  const rawText = (message.text || message.caption || "").trim()

  // If user forwarded a video/photo/doc or post containing movie details
  if (detectedMediaFileId || message.forward_from_chat || (rawText.length > 15 && (rawText.includes("🎬") || rawText.includes("BAACAg") || rawText.toLowerCase().includes("reyting") || rawText.toLowerCase().includes("janr")))) {
    const parsed = parseTelegramMediaPost(rawText, detectedMediaFileId)
    const draft = saveMediaDraft({
      ...parsed,
      chatId,
      fileId: detectedMediaFileId || parsed.fileId,
    })

    // Check if user has an active Web Sync Session
    const activeUploadSession = getActiveSessionForUser(chatId)
    let syncNotice = ""
    if (activeUploadSession) {
      updateUploadSession(activeUploadSession.sessionId, {
        videoFileId: detectedMediaFileId || parsed.fileId,
        photoFileId: photoFileId,
        title: parsed.title,
        year: parsed.year,
        rating: parsed.rating,
        quality: parsed.quality,
        duration: parsed.duration,
        genres: parsed.genres,
        synopsis: parsed.synopsis,
        type: parsed.type,
      })
      syncNotice = `\n⚡ <b>Saytdagi boshqaruv paneli bilan sinxronlandi!</b>\nSaytga qaytsangiz, barcha maydonlar avtomatik to'ldirilgan bo'ladi.\n`
    }

    const cardText = [
      `📥 <b>Yangi kino/anime posti aniqlandi!</b>`,
      ``,
      `🎬 <b>Nomi:</b> ${parsed.title} (${parsed.year})`,
      `⭐ <b>Reyting:</b> ${parsed.rating} | 🎞️ <b>Sifat:</b> ${parsed.quality}`,
      `🎭 <b>Janrlar:</b> ${parsed.genres.join(", ")}`,
      `⏳ <b>Davomiyligi:</b> ${parsed.duration}`,
      `📁 <b>File ID:</b> <code>${parsed.fileId || "Biriktirilmagan"}</code>`,
      syncNotice,
      `📝 <b>Tavsif:</b> <i>${parsed.synopsis.slice(0, 130)}...</i>`,
      ``,
      `Quyidagi tugmalardan birini bosing:`,
    ].join("\n")

    const draftButtons = [
      [
        { text: "🎬 Film sifatida qo'shish", callback_data: `draft:save:movie:${draft.id}` },
        { text: "🎭 Anime sifatida qo'shish", callback_data: `draft:save:anime:${draft.id}` },
      ],
      [
        { text: "📱 Mini Appda ochish", web_app: { url: `${siteUrl}/admin/tg` } },
        { text: "❌ Bekor qilish", callback_data: `draft:cancel:${draft.id}` },
      ],
    ]

    await sendTelegramMessage(chatId, cardText, {
      reply_markup: { inline_keyboard: draftButtons },
    })
    return
  }

  if (!rawText) return
  const text = rawText
  const lower = text.toLowerCase()

  // Admin command
  if (
    lower === "/admin" ||
    lower === "admin" ||
    lower === "/panel" ||
    lower === "/stats" ||
    lower === "👑 admin" ||
    lower === "admin panel"
  ) {
    await sendAdminPanel(chatId, firstName, siteUrl)
    return
  }

  // Start command (with deep linking support, e.g. /start admin, /start upload_...)
  if (lower.startsWith("/start")) {
    const payload = lower.replace("/start", "").trim()

    // 1. Upload live sync
    if (payload.startsWith("upload_")) {
      const sessionId = payload.replace("upload_", "").trim()
      setActiveSessionForUser(chatId, sessionId)
      await sendTelegramMessage(
        chatId,
        `🚀 <b>Sayt bilan jonli sinxronizatsiya faollashdi!</b>\n\nSessiya ID: <code>${sessionId}</code>\n\nEndi kino yoki animening <b>videosini</b> yoki <b>postini</b> shu yerga yuboring (yoki kanaldan forward qiling).\n\nFayl kelishi bilan saytda avtomatik to'ldiriladi!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📱 Mini Appni ochish", web_app: { url: `${siteUrl}/admin/tg` } }],
            ],
          },
        }
      )
      return
    }

    if (payload === "admin" || payload.startsWith("admin_")) {
      await sendAdminPanel(chatId, firstName, siteUrl)
      return
    }
    if (payload.startsWith("movie_") || payload.startsWith("film_")) {
      const movieId = payload.replace(/^(movie_|film_)/, "").trim()
      await sendMovieCard(chatId, movieId, siteUrl)
      return
    }
    await sendMainMenu(chatId, firstName, siteUrl)
    return
  }

  // Standard commands
  if (lower === "/menu" || lower === "🏠 bosh menyu") {
    await sendMainMenu(chatId, firstName, siteUrl)
    return
  }

  if (lower === "🎬 kino izlash" || lower === "/search") {
    const suggestions = getFeatured().slice(0, 4)
    const buttons = suggestions.map((m) => [
      { text: `🎬 ${m.title} (${m.year})`, callback_data: `movie:${m.id}` },
    ])
    await sendTelegramMessage(
      chatId,
      `🔍 <b>Film qidirish</b>\n\nIstalgan film nomini, aktyor yoki rejissyor ismini yozib yuboring:\n\nYoki quyidagi ommabop kinolardan birini tanlang:`,
      {
        reply_markup: { inline_keyboard: buttons },
      }
    )
    return
  }

  if (lower === "🔥 mashhur kinolar" || lower === "🔥 trend kinolar" || lower === "/trending") {
    await sendTrendingMovies(chatId, siteUrl)
    return
  }

  if (lower === "🆕 yangi filmlar" || lower === "🆕 yangi kinolar" || lower === "🎞️ premyeralar") {
    await sendNewMovies(chatId, siteUrl)
    return
  }

  if (lower === "🌟 top kinolar" || lower === "🌟 top reyting" || lower === "/top") {
    await sendTopMovies(chatId, siteUrl)
    return
  }

  if (lower === "🎭 janrlar" || lower === "🔎 janrlar" || lower === "/genres") {
    await sendGenresMenu(chatId)
    return
  }

  if (lower === "📺 seriallar & multfilmlar" || lower === "📺 seriallar" || lower === "🧸 multfilmlar") {
    await sendSeriesAndCartoons(chatId, siteUrl)
    return
  }

  if (lower.includes("onemedia sayti") || lower.includes("webapp") || lower === "/webapp") {
    await sendTelegramMessage(
      chatId,
      `🌐 <b>OneMedia Kino Portali</b>\n\nSevimli filmlaringizni to'g'ridan-to'g'ri Telegram ichida yoki brauzerda tomosha qilishingiz mumkin:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🍿 Portalni ochish (WebApp)", web_app: { url: siteUrl } }],
            [{ text: "🌐 Brauzerda ochish", url: siteUrl }],
          ],
        },
      }
    )
    return
  }

  if (lower === "📥 yuklab olish" || lower === "/download") {
    await sendTelegramMessage(
      chatId,
      [
        `📥 <b>Filmlarni yuklab olish</b>`,
        ``,
        `OneMedia platformasida barcha filmlar yuqori tezlikdagi serverlarda saqlanadi:`,
        `• <b>4K Ultra HD</b> — Katta ekranlar uchun`,
        `• <b>Full HD 1080p</b> — Noutbuklar uchun`,
        `• <b>HD 720p</b> — Smartfonlar uchun`,
        ``,
        `Kerakli filmni qidiruv orqali toping va uning ostidagi <b>📥 Yuklab olish</b> tugmasini bosing!`,
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔍 Film qidirish", callback_data: "menu:search" }],
            [{ text: "🔥 Mashhur kinolarga o'tish", callback_data: "menu:trending" }],
          ],
        },
      }
    )
    return
  }

  if (lower === "⭐ sevimlilar" || lower === "/favorites") {
    await sendTelegramMessage(
      chatId,
      [
        `⭐ <b>Sizning sevimli filmlaringiz</b>`,
        ``,
        `Filmlarni keyinroq tomosha qilish uchun har bir film ostidagi <b>⭐ Sevimlilarga</b> tugmasini bosing.`,
        ``,
        `Shaxsiy ro'yxatingizni OneMedia saytida ham to'liq boshqarishingiz mumkin:`,
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Sevimlilarni ko'rish (WebApp)", web_app: { url: `${siteUrl}/profile` } }],
          ],
        },
      }
    )
    return
  }

  if (lower === "ℹ️ yordam" || lower === "/help") {
    await sendTelegramMessage(
      chatId,
      [
        `ℹ️ <b>OneMedia Bot — Qo'llanma</b>`,
        ``,
        `1. <b>Kino qidirish:</b> Shunchaki film nomini yoki aktyor ismini yozib yuboring (masalan: <i>Nebula</i> yoki <i>Tuman</i>).`,
        `2. <b>Raqam bo'yicha:</b> Film tartib raqamini yuborishingiz mumkin (1 dan 12 gacha).`,
        `3. <b>WebApp:</b> Telegramdan chiqmasdan to'liq kinoteatr interfeysidan foydalanish imkoniyati.`,
        `4. <b>Sifat:</b> Barcha kinolar 4K, FHD va HD sifatda taqdim etiladi.`,
        ``,
        `Savol yoki takliflar bo'yicha: @OneMediaAdmin`,
        `Rasmiy sayt: ${siteUrl}`,
      ].join("\n")
    )
    return
  }

  // Any other text is treated as a movie search!
  await handleSearch(chatId, text, siteUrl)
}

export async function GET(request: Request) {
  const siteUrl = getSiteUrl(request)
  const configured = isTelegramConfigured()
  const botInfo = configured ? await getBotMe().catch(() => null) : null

  return NextResponse.json({
    ok: true,
    service: "onemedia-telegram-webhook",
    configured,
    botUsername: botInfo?.username ? `@${botInfo.username}` : null,
    botName: botInfo?.first_name || null,
    detectedSiteUrl: siteUrl,
    webhookEndpoint: `${siteUrl}/api/telegram/webhook`,
    secretConfigured: Boolean(telegramWebhookSecret),
  })
}

export async function POST(request: Request) {
  // If secret token is provided in headers, verify it against telegramWebhookSecret if secret is configured
  const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token")
  if (telegramWebhookSecret && incomingSecret && incomingSecret !== telegramWebhookSecret) {
    console.warn("[OneMedia Telegram] Secret token mismatch")
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null
  if (!update) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
  }

  const siteUrl = getSiteUrl(request)

  try {
    await handleUpdate(update, siteUrl)
  } catch (error) {
    console.error("[OneMedia Telegram] Error handling update:", error)
  }

  return NextResponse.json({ ok: true })
}
