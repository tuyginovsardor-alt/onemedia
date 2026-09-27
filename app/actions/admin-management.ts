'use server'

import { revalidatePath } from "next/cache"
import {
  addAdmin,
  removeAdmin,
  addSponsorChannel,
  removeSponsorChannel,
  addPaymentCard,
  removePaymentCard,
  toggleCardActive,
  reviewReceipt,
  createBroadcast,
  type AdminUser,
} from "@/lib/admin-store"
import { addMediaItem, deleteMediaItem } from "@/lib/anime-store"
import { sendTelegramMessage } from "@/lib/telegram"

// 1. Film / Anime actions
export async function createMediaAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const type = String(formData.get("type") || "movie") as "movie" | "anime" | "series"
  const year = parseInt(String(formData.get("year") || "2025"), 10)
  const rating = parseFloat(String(formData.get("rating") || "8.5"))
  const duration = String(formData.get("duration") || "1h 50m").trim()
  const genresStr = String(formData.get("genres") || "Jangari").trim()
  const genres = genresStr.split(",").map((g) => g.trim()).filter(Boolean)
  const quality = (String(formData.get("quality") || "4K") as "4K" | "FHD" | "HD")
  const synopsis = String(formData.get("synopsis") || "").trim()
  const director = String(formData.get("director") || "OneMedia Studio").trim()
  const poster = String(formData.get("poster") || "/images/poster-1.png").trim()
  const backdrop = String(formData.get("backdrop") || "/images/hero-1.png").trim()
  const telegramFileId = String(formData.get("telegramFileId") || "").trim()
  const totalEpisodes = parseInt(String(formData.get("totalEpisodes") || "1"), 10)

  if (!title) throw new Error("Film yoki anime nomi kiritilishi shart")

  const episodes = []
  if (type === "anime" || type === "series") {
    for (let i = 1; i <= Math.min(totalEpisodes, 24); i++) {
      episodes.push({
        id: `ep-${i}`,
        episodeNumber: i,
        title: `${i}-qism`,
        duration: "24 daq",
        quality: quality === "4K" ? ("4K" as const) : ("1080p" as const),
        telegramFileId: i === 1 ? telegramFileId : undefined,
      })
    }
  } else {
    episodes.push({
      id: "ep-1",
      episodeNumber: 1,
      title: "To'liq film",
      duration,
      quality: quality === "4K" ? ("4K" as const) : ("1080p" as const),
      telegramFileId: telegramFileId || undefined,
    })
  }

  addMediaItem({
    title,
    type,
    year,
    rating,
    duration,
    ageRating: "16+",
    genres: genres.length > 0 ? genres : ["Jangari"],
    poster: poster || "/images/poster-1.png",
    backdrop: backdrop || "/images/hero-1.png",
    synopsis: synopsis || `${title} — OneMedia platformasida 4K sifatda.`,
    director,
    cast: ["OneMedia Ijodiy Guruhi"],
    quality,
    featured: true,
    totalEpisodes,
    episodes,
  })

  revalidatePath("/catalog")
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

export async function deleteMediaAction(id: string) {
  deleteMediaItem(id)
  revalidatePath("/catalog")
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

// 2. Admin management actions
export async function addAdminAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  const identifier = String(formData.get("identifier") || "").trim()
  const type = identifier.includes("@") && !identifier.startsWith("@") ? "email" : "telegram"
  const role = (String(formData.get("role") || "admin") as AdminUser["role"])

  if (!name || !identifier) throw new Error("Ism va identifikator kiritilishi shart")

  addAdmin({
    name,
    type,
    identifier,
    role,
    permissions: {
      manageMovies: true,
      managePayments: role === "super_admin" || role === "admin",
      broadcast: role === "super_admin" || role === "admin",
      manageSponsors: role === "super_admin",
      manageAdmins: role === "super_admin",
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

export async function removeAdminAction(id: string) {
  removeAdmin(id)
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

// 3. Sponsor Channel actions
export async function addSponsorAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const username = String(formData.get("username") || "").trim()
  const inviteLink = String(formData.get("inviteLink") || "").trim()

  if (!title || !username) throw new Error("Kanal nomi va username kiritilishi shart")

  addSponsorChannel({
    title,
    username: username.startsWith("@") ? username : `@${username}`,
    inviteLink: inviteLink || `https://t.me/${username.replace("@", "")}`,
    required: true,
  })

  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

export async function removeSponsorAction(id: string) {
  removeSponsorChannel(id)
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

// 4. Payment Card actions
export async function addCardAction(formData: FormData) {
  const bankName = String(formData.get("bankName") || "").trim()
  const cardNumber = String(formData.get("cardNumber") || "").trim()
  const cardHolder = String(formData.get("cardHolder") || "").trim()
  const paymentType = (String(formData.get("paymentType") || "Uzcard") as "Uzcard" | "Humo" | "Click" | "Payme")

  if (!bankName || !cardNumber || !cardHolder) throw new Error("Karta ma'lumotlarini to'liq kiriting")

  addPaymentCard({
    bankName,
    cardNumber,
    cardHolder: cardHolder.toUpperCase(),
    paymentType,
    active: true,
  })

  revalidatePath("/payment")
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

export async function toggleCardAction(id: string) {
  toggleCardActive(id)
  revalidatePath("/payment")
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

export async function removeCardAction(id: string) {
  removePaymentCard(id)
  revalidatePath("/payment")
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}

// 5. Receipt review action
export async function reviewReceiptAction(id: string, status: "approved" | "rejected", note?: string) {
  await reviewReceipt(id, status, note)
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  revalidatePath("/payment")
  return { success: true }
}

// 6. Broadcast action
export async function sendBroadcastAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const message = String(formData.get("message") || "").trim()
  const buttonText = String(formData.get("buttonText") || "").trim()
  const buttonUrl = String(formData.get("buttonUrl") || "").trim()

  if (!title || !message) throw new Error("Sarlavha va xabar kiritilishi shart")

  createBroadcast({
    title,
    message,
    buttonText: buttonText || undefined,
    buttonUrl: buttonUrl || undefined,
  })

  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { success: true }
}
