"use client"

import { useState, useEffect, useRef } from "react"
import {
  Tv,
  Film,
  Sparkles,
  Plus,
  CheckCircle,
  Video,
  ListPlus,
  Wand2,
  Layers,
  Send,
  Loader2,
  Trash2,
  ExternalLink,
  Mic,
  Calendar,
  Clock,
  Image as ImageIcon,
  Star,
  Globe,
  ShieldAlert,
  Users,
  Clapperboard,
} from 'lucide-react'
import { parseTelegramMediaPost } from "@/lib/media-parser"
import { createMediaAction } from "@/app/actions/admin-management"

const POPULAR_GENRES = [
  "Anime",
  "Jangari",
  "Fantastika",
  "Sarguzasht",
  "Komediya",
  "Drama",
  "Triller",
  "Multfilm",
  "Tarixiy",
  "Qo'rqinchli",
  "Melodrama",
  "Kriminal",
  "Detektiv",
  "Isekai",
  "Shounen",
  "Seinen",
  "Psixologik",
]

const COUNTRIES = [
  "AQSH (Hollywood)",
  "Yaponiya",
  "Janubiy Koreya",
  "O'zbekiston",
  "Turkiya",
  "Buyuk Britaniya",
  "Fransiya",
  "Rossiya",
  "Xitoy",
  "Hindiston",
]

const LANGUAGES = [
  "O'zbekcha (Professional Dublyaj)",
  "O'zbekcha (FanDub)",
  "Ruscha (Professional)",
  "Asl tilda (Subtitr bilan)",
  "Inglizcha (Asl til)",
  "Yaponcha (Asl til)",
  "Koreyscha (Asl til)",
]

const DUBBING_STUDIOS = [
  "OneMedia Dublyaj",
  "AnimeDub",
  "AsilMedia Dublyaj",
  "FanDub Uz",
  "SilkRoad Anime",
  "UzAnime Group",
  "Tarjima Kinolar",
  "Milliy TV Dublyaj",
]

const AGE_RATINGS = [
  { value: "0+", label: "0+ (Barchaga tavsiya)" },
  { value: "6+", label: "6+ (Kichik yoshdagilar)" },
  { value: "12+", label: "12+ (O'smirlar)" },
  { value: "16+", label: "16+ (16 yoshdan yuqori)" },
  { value: "18+", label: "18+ (Faqat kattalar uchun)" },
]

type EpisodeItem = {
  episodeNumber: number
  title: string
  fileId: string
  posterFileId?: string
  duration: string
}

export function SmartMediaAdder() {
  const [mode, setMode] = useState<"movie" | "anime" | "series">("movie")
  const [pasteText, setPasteText] = useState("")
  const [showAutoParser, setShowAutoParser] = useState(false)

  // 1. Title & Identity
  const [title, setTitle] = useState("")
  const [originalTitle, setOriginalTitle] = useState("")

  // 2. Separate Files (Poster Photo vs Video File ID)
  const [posterFileId, setPosterFileId] = useState("")
  const [posterUrl, setPosterUrl] = useState("")
  const [telegramFileId, setTelegramFileId] = useState("")
  const [backdropUrl, setBackdropUrl] = useState("")
  const [trailerUrl, setTrailerUrl] = useState("")

  // 3. Metadata & Details
  const [year, setYear] = useState(2025)
  const [rating, setRating] = useState(8.8)
  const [quality, setQuality] = useState<"4K" | "FHD" | "HD">("4K")
  const [duration, setDuration] = useState("1h 50m")
  const [ageRating, setAgeRating] = useState("16+")
  const [country, setCountry] = useState("AQSH (Hollywood)")
  const [language, setLanguage] = useState("O'zbekcha (Professional Dublyaj)")
  const [dubbingStudio, setDubbingStudio] = useState("OneMedia Dublyaj")
  const [genres, setGenres] = useState("Jangari, Fantastika")
  const [synopsis, setSynopsis] = useState("")
  const [director, setDirector] = useState("")
  const [cast, setCast] = useState("")
  const [featured, setFeatured] = useState(true)

  // 4. Anime & Series Specific
  const [season, setSeason] = useState(1)
  const [animeStatus, setAnimeStatus] = useState<"ongoing" | "completed">("completed")
  const [totalEpisodes, setTotalEpisodes] = useState(12)
  const [episodesList, setEpisodesList] = useState<EpisodeItem[]>([
    { episodeNumber: 1, title: "1-qism", fileId: "", duration: "24 daq" },
  ])
  const [bulkFileIds, setBulkFileIds] = useState("")

  // 5. Telegram Live Sync
  const [syncSessionId, setSyncSessionId] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "waiting" | "received">("idle")
  const [syncMessage, setSyncMessage] = useState("")
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  // Start Telegram Bot Live Sync session
  async function handleStartBotSync() {
    setSyncStatus("waiting")
    setSyncMessage("Telegram bot bilan bog'lanish yaratilmoqda...")

    try {
      const res = await fetch("/api/telegram/sync-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()

      if (data.sessionId) {
        setSyncSessionId(data.sessionId)
        setSyncMessage(`🟡 Botingizga video yoki postni tashlang... (Kutilmoqda)`)

        const botUrl = data.botUrl || `https://t.me/onemediahd_bot?start=upload_${data.sessionId}`
        try {
          const tg = (window as any).Telegram?.WebApp
          if (tg?.openTelegramLink) {
            tg.openTelegramLink(botUrl)
          } else {
            window.open(botUrl, "_blank")
          }
        } catch {
          window.open(botUrl, "_blank")
        }

        startPollingSync(data.sessionId)
      }
    } catch (err) {
      setSyncStatus("idle")
      setSyncMessage("Xatolik: Botga ulanib bo'lmadi")
    }
  }

  function startPollingSync(sessionId: string) {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/sync-upload?session=${sessionId}`)
        const json = await res.json()

        if (json.status === "received" && json.data) {
          const d = json.data
          setSyncStatus("received")
          setSyncMessage("🎉 Video va rasm botdan qabul qilindi!")

          // Autofill form
          if (d.title) setTitle(d.title)
          if (d.year) setYear(d.year)
          if (d.rating) setRating(d.rating)
          if (d.quality) setQuality(d.quality)
          if (d.duration) setDuration(d.duration)
          if (d.genres && d.genres.length > 0) setGenres(d.genres.join(", "))
          if (d.synopsis) setSynopsis(d.synopsis)
          if (d.videoFileId) setTelegramFileId(d.videoFileId)
          if (d.photoFileId) setPosterFileId(d.photoFileId)
          if (d.type === "anime") {
            setMode("anime")
            if (d.totalEpisodes) setTotalEpisodes(d.totalEpisodes)
          }

          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch {
        // ignore network hiccups
      }
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Auto-parse Telegram Post Text
  function handleAutoParse() {
    if (!pasteText.trim()) return
    const parsed = parseTelegramMediaPost(pasteText)
    if (parsed.title) setTitle(parsed.title)
    if (parsed.originalTitle) setOriginalTitle(parsed.originalTitle)
    if (parsed.year) setYear(parsed.year)
    if (parsed.rating) setRating(parsed.rating)
    if (parsed.quality) setQuality(parsed.quality)
    if (parsed.duration) setDuration(parsed.duration)
    if (parsed.genres && parsed.genres.length > 0) setGenres(parsed.genres.join(", "))
    if (parsed.synopsis) setSynopsis(parsed.synopsis)
    if (parsed.fileId) setTelegramFileId(parsed.fileId)
    if (parsed.photoFileId) setPosterFileId(parsed.photoFileId)
    if (parsed.dubbingStudio) setDubbingStudio(parsed.dubbingStudio)
    if (parsed.country) setCountry(parsed.country)
    if (parsed.ageRating) setAgeRating(parsed.ageRating)

    if (parsed.type === "anime" || parsed.type === "series") {
      setMode(parsed.type as "anime" | "series")
      if (parsed.season) setSeason(parsed.season)
      const count = parsed.totalEpisodes && parsed.totalEpisodes > 0 ? parsed.totalEpisodes : 12
      setTotalEpisodes(count)

      // Auto-generate episode rows
      const eps: EpisodeItem[] = []
      for (let i = 1; i <= Math.min(count, 30); i++) {
        eps.push({
          episodeNumber: i,
          title: `${i}-qism`,
          fileId: i === 1 && parsed.fileId ? parsed.fileId : "",
          posterFileId: parsed.photoFileId || "",
          duration: "24 daq",
        })
      }
      setEpisodesList(eps)
    }
    setShowAutoParser(false)
  }

  function applyAnimePreset(presetName: string) {
    if (presetName === "solo_leveling") {
      setMode("anime")
      setTitle("Solo Leveling 2-mavsum (Arise from the Shadow)")
      setOriginalTitle("Ore dake Level Up na Ken Season 2")
      setYear(2025)
      setRating(9.3)
      setQuality("4K")
      setDuration("24 daq")
      setCountry("Yaponiya")
      setDubbingStudio("AnimeDub")
      setGenres("Anime, Jangari, Fantastika, Isekai, Shounen")
      setSynopsis("Sung Jin-Woo soya lordi sifatida o'zining yangi armiyasini yig'ib, S-darajali dahshatli maxluqlarga qarshi jangga kirishadi.")
      setSeason(2)
      setTotalEpisodes(12)
      const eps: EpisodeItem[] = []
      for (let i = 1; i <= 12; i++) {
        eps.push({ episodeNumber: i, title: `${i}-qism`, fileId: "", duration: "24 daq" })
      }
      setEpisodesList(eps)
    } else if (presetName === "demon_slayer") {
      setMode("anime")
      setTitle("Demon Slayer: Hashira Training Arc")
      setOriginalTitle("Kimetsu no Yaiba Season 4")
      setYear(2024)
      setRating(9.0)
      setQuality("4K")
      setDuration("24 daq")
      setCountry("Yaponiya")
      setDubbingStudio("AnimeDub")
      setGenres("Anime, Jangari, Fantastika, Shounen")
      setSynopsis("Tanjiro va uning do'stlari ustunlar (Hashira) rahbarligida Muzan Kibutsuji va uning iblislariga qarshi hal qiluvchi jangga tayyorgarlik ko'rishadi.")
      setSeason(4)
      setTotalEpisodes(8)
      const eps: EpisodeItem[] = []
      for (let i = 1; i <= 8; i++) {
        eps.push({ episodeNumber: i, title: `${i}-qism`, fileId: "", duration: "24 daq" })
      }
      setEpisodesList(eps)
    } else if (presetName === "naruto") {
      setMode("anime")
      setTitle("Naruto Shippuden (Klassik)")
      setOriginalTitle("Naruto Shippuuden")
      setYear(2023)
      setRating(8.9)
      setQuality("FHD")
      setDuration("24 daq")
      setCountry("Yaponiya")
      setDubbingStudio("UzAnime Group")
      setGenres("Anime, Jangari, Sarguzasht, Shounen")
      setSynopsis("Naruto Uzumaki Konoha qishlog'ini va do'stlarini qutqarish uchun Akatsuki tashkilotiga qarshi kurashadi.")
      setSeason(1)
      setTotalEpisodes(24)
      const eps: EpisodeItem[] = []
      for (let i = 1; i <= 24; i++) {
        eps.push({ episodeNumber: i, title: `${i}-qism`, fileId: "", duration: "24 daq" })
      }
      setEpisodesList(eps)
    }
  }

  function toggleGenre(genre: string) {
    const list = genres.split(",").map((g) => g.trim()).filter(Boolean)
    if (list.includes(genre)) {
      setGenres(list.filter((g) => g !== genre).join(", "))
    } else {
      setGenres([...list, genre].join(", "))
    }
  }

  function addEpisode() {
    const nextNum = episodesList.length + 1
    setEpisodesList([
      ...episodesList,
      { episodeNumber: nextNum, title: `${nextNum}-qism`, fileId: "", duration: "24 daq" },
    ])
    setTotalEpisodes(nextNum)
  }

  function removeEpisode(idx: number) {
    const next = episodesList.filter((_, i) => i !== idx)
    setEpisodesList(next)
    setTotalEpisodes(next.length)
  }

  function updateEpisode(idx: number, field: keyof EpisodeItem, val: any) {
    const next = [...episodesList]
    next[idx] = { ...next[idx], [field]: val }
    setEpisodesList(next)
    if (idx === 0 && field === "fileId") {
      setTelegramFileId(val)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg("")

    const formData = new FormData()
    formData.append("title", title)
    if (originalTitle) formData.append("originalTitle", originalTitle)
    formData.append("type", mode)
    formData.append("year", year.toString())
    formData.append("rating", rating.toString())
    formData.append("duration", duration)
    formData.append("quality", quality)
    formData.append("ageRating", ageRating)
    formData.append("country", country)
    formData.append("language", language)
    formData.append("dubbingStudio", dubbingStudio)
    formData.append("genres", genres)
    formData.append("synopsis", synopsis)
    formData.append("director", director)
    formData.append("cast", cast)
    formData.append("poster", posterUrl)
    formData.append("posterFileId", posterFileId)
    formData.append("backdrop", backdropUrl)
    formData.append("trailerUrl", trailerUrl)
    formData.append("telegramFileId", telegramFileId)
    formData.append("featured", featured ? "true" : "false")
    formData.append("totalEpisodes", mode === "anime" ? totalEpisodes.toString() : "1")

    if (mode === "anime") {
      formData.append("season", season.toString())
      formData.append("animeStatus", animeStatus)
      formData.append("episodesJson", JSON.stringify(episodesList))
    }

    try {
      await createMediaAction(formData)
      setLoading(false)
      setSuccessMsg(`🎉 «${title}» Neon ma'lumotlar bazasiga muvaffaqiyatli saqlandi!`)
      setTitle("")
      setOriginalTitle("")
      setSynopsis("")
      setTelegramFileId("")
      setPosterFileId("")
      setPosterUrl("")
      setBackdropUrl("")
      setTrailerUrl("")
      setBulkFileIds("")
      setDirector("")
      setCast("")
      setSyncStatus("idle")
      setSyncMessage("")
      setTimeout(() => setSuccessMsg(""), 5000)
    } catch (err) {
      setLoading(false)
      alert((err as Error).message || "Xatolik yuz berdi")
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Helper: Bot Live Sync + Auto-Parser */}
      <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 p-4 space-y-3 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Aqlli Sinxronizatsiya (Neon PostgreSQL Bazasi)
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              Rasm va videolarni Telegram bot orqali avtomatik ajratib yuklash yoki matndan to&apos;ldirish
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleStartBotSync}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                syncStatus === "waiting"
                  ? "bg-amber-400 text-slate-950 animate-pulse"
                  : syncStatus === "received"
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20"
              }`}
            >
              {syncStatus === "waiting" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Botdan kutilmoqda...
                </>
              ) : syncStatus === "received" ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" /> Qabul qilindi!
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> 🤖 Bot orqali yuklash
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAutoParser((p) => !p)}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
              {showAutoParser ? "Yashirish" : "Matndan to'ldirish"}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div
            className={`rounded-xl p-3 text-xs flex items-center justify-between gap-2 border ${
              syncStatus === "received"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-amber-400/40 bg-amber-400/10 text-amber-200"
            }`}
          >
            <span>{syncMessage}</span>
            {syncStatus === "waiting" && (
              <a
                href={syncSessionId ? `https://t.me/onemediahd_bot?start=upload_${syncSessionId}` : "https://t.me/onemediahd_bot"}
                target="_blank"
                rel="noreferrer"
                className="underline text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1"
              >
                Botni ochish <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Auto Parser Textarea Drawer */}
      {showAutoParser && (
        <div className="rounded-2xl border border-cyan-400/40 bg-slate-950 p-4 space-y-3 animate-in fade-in duration-200">
          <label className="text-xs font-bold text-cyan-300 block">
            Telegram Kanaldan nusxalangan post matnini tashlang:
          </label>
          <textarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Masalan:\n🎬 Nomi: Solo Leveling 2-mavsum\n📅 Yil: 2025\n⭐ Reyting: 9.1\n🎭 Janr: Anime, Jangari, Fantastika\n📁 File ID: BAACAgIAAxkBA...\n📝 Tavsif: Insoniyatning eng zaif ovchisi...`}
            className="w-full rounded-xl border border-white/15 bg-black/60 p-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-white/50">Tezkor shablonlar:</span>
              <button
                type="button"
                onClick={() => applyAnimePreset("solo_leveling")}
                className="rounded-lg bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-400/20"
              >
                🎭 Solo Leveling 2
              </button>
              <button
                type="button"
                onClick={() => applyAnimePreset("demon_slayer")}
                className="rounded-lg bg-purple-400/10 border border-purple-400/30 px-2.5 py-1 text-[10px] font-bold text-purple-300 hover:bg-purple-400/20"
              >
                ⚔️ Demon Slayer 4
              </button>
              <button
                type="button"
                onClick={() => applyAnimePreset("naruto")}
                className="rounded-lg bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-400/20"
              >
                🍥 Naruto Shippuden
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPasteText("")}
                className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white"
              >
                Tozalash
              </button>
              <button
                type="button"
                onClick={handleAutoParse}
                className="rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 flex items-center gap-1.5 shadow-md shadow-cyan-400/20"
              >
                <Sparkles className="h-3.5 w-3.5" /> Matndan to&apos;ldirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector (Film vs Anime vs Serial) */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("movie")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition border ${
            mode === "movie"
              ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-400/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
          }`}
        >
          <Film className="h-4 w-4" /> 🎬 Film qo&apos;shish
        </button>

        <button
          type="button"
          onClick={() => setMode("anime")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition border ${
            mode === "anime"
              ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
          }`}
        >
          <Tv className="h-4 w-4" /> 🎭 Anime qo&apos;shish
        </button>

        <button
          type="button"
          onClick={() => setMode("series")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition border ${
            mode === "series"
              ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
          }`}
        >
          <Clapperboard className="h-4 w-4" /> 📺 Serial qo&apos;shish
        </button>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Extensive Form */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        {/* SECTION 1: NOM VA IDENTIFIKATSIYA */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" /> 1. Film / Anime Nomi va Asl Nomi
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">
                Nomi (O&apos;zbekcha): <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mode === "anime" ? "masalan: Solo Leveling 2-mavsum" : "masalan: Qasoskorlar: Intiho"}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 block mb-1">
                Asl Nomi (Inglizcha / Yaponcha):
              </label>
              <input
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                placeholder="masalan: Avengers: Endgame yoki Ore dake Level Up"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ALOHIDA-ALOHIDA FAYLLAR (POSTER RASM VA VIDEO FAYL) */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> 2. Post Rasm va Video Fayl (Alohida kiritish)
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* POSTER RASM */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-amber-200 block">
                📸 Post Rasm (Telegram Photo File ID yoki URL):
              </label>
              <input
                value={posterFileId}
                onChange={(e) => setPosterFileId(e.target.value)}
                placeholder="AgACAgIAAxkBAAE... (Telegram Photo File ID)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-mono text-amber-300 placeholder-white/30 focus:border-amber-400 focus:outline-none"
              />
              <input
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="yoki rasm URL (https://...)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
              />
              {posterFileId && (
                <p className="text-[10px] text-amber-300/80">
                  ✓ Telegram Photo File ID biriktirildi. Sayt uni avtomatik ochadi.
                </p>
              )}
            </div>

            {/* ASOSIY VIDEO FAYL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-cyan-200 block">
                🎬 Video Fayl (Telegram Video File ID):
              </label>
              <input
                value={telegramFileId}
                onChange={(e) => setTelegramFileId(e.target.value)}
                placeholder="BAACAgIAAxkBAAE... (Telegram Video File ID)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-mono text-cyan-300 placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
              <input
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="Rasmiy Treyler (YouTube yoki Telegram link)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
              <input
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                placeholder="Fon Banner rasmi URL (ixtiyoriy)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: TEXNIK PARAMETRLAR VA CHIQUVCHI MA'LUMOTLAR */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> 3. Asosiy Xususiyatlar va Parametrlar
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Yili:</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Reyting (1-10):</label>
              <input
                type="number"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Sifat darajasi:</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="4K">4K Ultra HD (Dolby Vision)</option>
                <option value="FHD">Full HD 1080p</option>
                <option value="HD">HD 720p</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                {mode === "anime" ? "Qismlar soni:" : "Davomiyligi:"}
              </label>
              {mode === "anime" ? (
                <input
                  type="number"
                  value={totalEpisodes}
                  onChange={(e) => setTotalEpisodes(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              ) : (
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="2h 15m"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-xs text-white/70 block mb-1 flex items-center gap-1">
                <Globe className="h-3 w-3 text-cyan-400" /> Mamlakat (Davlat):
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1 flex items-center gap-1">
                <Mic className="h-3 w-3 text-purple-400" /> Til va Dublyaj:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-amber-400" /> Yosh Chegarasi:
              </label>
              <select
                value={ageRating}
                onChange={(e) => setAgeRating(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                {AGE_RATINGS.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: IJODIY GURUH (REJISSYOR VA AKTYORLAR) */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> 4. Ijodiy Guruh va Dublyaj Studiyasi
          </h4>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Rejissyor / Muallif:</label>
              <input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="masalan: Kristofer Nolan"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Dublyaj Studiyasi:</label>
              <select
                value={dubbingStudio}
                onChange={(e) => setDubbingStudio(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                {DUBBING_STUDIOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Bosh Rollarda (Aktyorlar):</label>
              <input
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                placeholder="masalan: Robert Downey Jr., Chris Evans"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ================= ANIME SPECIFIC SECTION ================= */}
        {mode === "anime" && (
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Tv className="h-4 w-4" /> Anime Qismlari va Mavsum Boshqaruvi
              </h4>
              <span className="text-[10px] text-white/50">Mavsumlar va Dublyaj boshqaruvi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Mavsum (Season):</label>
                <input
                  type="number"
                  min={1}
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Holati (Status):</label>
                <select
                  value={animeStatus}
                  onChange={(e) => setAnimeStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="completed">Tugallangan (Completed)</option>
                  <option value="ongoing">Davom etmoqda (Ongoing)</option>
                </select>
              </div>
            </div>

            {/* Individual Episode Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-purple-200">
                  Anime qismlari ro&apos;yxati ({episodesList.length} ta):
                </label>
                <button
                  type="button"
                  onClick={addEpisode}
                  className="rounded-lg bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/30 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Qism qo&apos;shish
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {episodesList.map((ep, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 text-xs"
                  >
                    <span className="w-12 text-center font-bold text-purple-400">{ep.episodeNumber}-qism</span>
                    <input
                      value={ep.title}
                      onChange={(e) => updateEpisode(idx, "title", e.target.value)}
                      placeholder="Qism nomi"
                      className="w-28 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                    />
                    <input
                      value={ep.fileId}
                      onChange={(e) => updateEpisode(idx, "fileId", e.target.value)}
                      placeholder="Telegram Video File ID"
                      className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs font-mono text-cyan-300 placeholder-white/20"
                    />
                    <input
                      value={ep.duration}
                      onChange={(e) => updateEpisode(idx, "duration", e.target.value)}
                      placeholder="24 daq"
                      className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                    />
                    {episodesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEpisode(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk File ID paste alternative */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] text-white/60 block">
                Yoki barcha qismlar File ID larini bir vaqtning o&apos;zida tashlang (har qatorga bittadan):
              </label>
              <textarea
                rows={2}
                value={bulkFileIds}
                onChange={(e) => {
                  setBulkFileIds(e.target.value)
                  const lines = e.target.value.split("\n").filter((l) => l.trim().length > 10)
                  if (lines.length > 0) {
                    setTotalEpisodes(lines.length)
                    setTelegramFileId(lines[0].trim())
                    const newEps = lines.map((fid, i) => ({
                      episodeNumber: i + 1,
                      title: `${i + 1}-qism`,
                      fileId: fid.trim(),
                      duration: "24 daq",
                    }))
                    setEpisodesList(newEps)
                  }
                }}
                placeholder={`1-qism Telegram File ID\n2-qism Telegram File ID\n3-qism Telegram File ID...`}
                className="w-full rounded-xl border border-white/10 bg-black/50 p-2 text-xs font-mono text-cyan-300 placeholder-white/30 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* SECTION 5: JANRLAR */}
        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1.5">
            Janrlar (bosing yoki yozing):
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {POPULAR_GENRES.map((g) => {
              const selected = genres.includes(g)
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    selected
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
          <input
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* SECTION 6: TAVSIF (MAZMUNI) */}
        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">
            Mazmuni va To&apos;liq Tavsifi (Synopsis):
          </label>
          <textarea
            rows={3}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Film yoki anime mazmuni haqida to'liq ma'lumot..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* SECTION 7: FEATURED CHECKBOX */}
        <div className="flex items-center gap-2 text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/10">
          <input
            type="checkbox"
            id="featured_check"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400 cursor-pointer"
          />
          <label htmlFor="featured_check" className="cursor-pointer select-none">
            ⭐ <b>Bosh sahifa va Tavsiyalarga chiqarish</b> (Top Banner & Featured blokida ko&apos;rinadi)
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 transition shadow-lg ${
            mode === "anime"
              ? "bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20"
              : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20"
          }`}
        >
          <Plus className="h-4 w-4" />
          {loading
            ? "Neon Ma'lumotlar Bazasiga saqlanmoqda..."
            : mode === "anime"
            ? "🎭 Yangi Animeni Neon Bazasiga Saqlash"
            : "🎬 Yangi Filmni Neon Bazasiga Saqlash"}
        </button>
      </form>
    </div>
  )
}
