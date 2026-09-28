import { telegramApi, sendTelegramMessage } from "@/lib/telegram"

// ==========================================
// 1. ADMIN USER & RBAC MANAGEMENT
// ==========================================
export type AdminUser = {
  id: string
  name: string
  type: "telegram" | "email"
  identifier: string // Email (e.g. tuyginovsardor4@gmail.com) or Telegram username/ID (e.g. @sardor or 12345678)
  role: "super_admin" | "admin" | "moderator"
  permissions: {
    manageMovies: boolean
    managePayments: boolean
    broadcast: boolean
    manageSponsors: boolean
    manageAdmins: boolean
  }
  addedAt: string
}

// Initial admins list (includes Sardor)
let globalAdmins: AdminUser[] = [
  {
    id: "admin-sardor-email",
    name: "Sardor Tuyginov (Asosiy Admin)",
    type: "email",
    identifier: "tuyginovsardor4@gmail.com",
    role: "super_admin",
    permissions: {
      manageMovies: true,
      managePayments: true,
      broadcast: true,
      manageSponsors: true,
      manageAdmins: true,
    },
    addedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "admin-sardor-tg-id",
    name: "Sardor Tuyginov (Telegram ID)",
    type: "telegram",
    identifier: "8021115446",
    role: "super_admin",
    permissions: {
      manageMovies: true,
      managePayments: true,
      broadcast: true,
      manageSponsors: true,
      manageAdmins: true,
    },
    addedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "admin-sardor-tg",
    name: "Sardor Tuyginov (Telegram)",
    type: "telegram",
    identifier: "sardor",
    role: "super_admin",
    permissions: {
      manageMovies: true,
      managePayments: true,
      broadcast: true,
      manageSponsors: true,
      manageAdmins: true,
    },
    addedAt: "2026-01-01T00:00:00.000Z",
  },
]

export function getAdmins(): AdminUser[] {
  return globalAdmins
}

export function addAdmin(newAdmin: Omit<AdminUser, "id" | "addedAt">): AdminUser {
  const admin: AdminUser = {
    ...newAdmin,
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    addedAt: new Date().toISOString(),
  }
  globalAdmins.push(admin)
  return admin
}

export function removeAdmin(id: string): boolean {
  if (id === "admin-sardor-email") return false // Cannot delete main super admin
  globalAdmins = globalAdmins.filter((a) => a.id !== id)
  return true
}

export function isAuthorizedAdmin(identifier?: string | null): boolean {
  if (!identifier) return false
  const clean = identifier.trim().toLowerCase().replace("@", "")
  return globalAdmins.some((a) => {
    const aid = a.identifier.trim().toLowerCase().replace("@", "")
    return aid === clean || aid.includes(clean) || clean.includes(aid)
  })
}

// ==========================================
// 2. MAJBURIY KANALLAR (MANDATORY SPONSORS)
// ==========================================
export type SponsorChannel = {
  id: string
  title: string
  username: string // e.g. @onemediakino
  inviteLink: string // e.g. https://t.me/onemediakino
  chatId?: string // Channel numeric ID if available
  required: boolean
  order: number
}

let globalSponsors: SponsorChannel[] = [
  {
    id: "sp-1",
    title: "OneMedia Rasmiy Kanali",
    username: "@onemedia_kino",
    inviteLink: "https://t.me/OneMediaHdBot",
    required: true,
    order: 1,
  },
  {
    id: "sp-2",
    title: "Premyera Kinolar & Anime 4K",
    username: "@onemedia_hd",
    inviteLink: "https://t.me/OneMediaHdBot",
    required: true,
    order: 2,
  },
]

export function getSponsorChannels(): SponsorChannel[] {
  return [...globalSponsors].sort((a, b) => a.order - b.order)
}

export function addSponsorChannel(channel: Omit<SponsorChannel, "id" | "order">): SponsorChannel {
  const newChannel: SponsorChannel = {
    ...channel,
    id: `sp-${Date.now()}`,
    order: globalSponsors.length + 1,
  }
  globalSponsors.push(newChannel)
  return newChannel
}

export function removeSponsorChannel(id: string): boolean {
  globalSponsors = globalSponsors.filter((s) => s.id !== id)
  return true
}

// Check if user is subscribed to sponsor channel
export async function checkChannelSubscription(channelUsername: string, userId: number | string): Promise<boolean> {
  try {
    const member = await telegramApi<{ status: string }>("getChatMember", {
      chat_id: channelUsername.startsWith("@") ? channelUsername : `@${channelUsername}`,
      user_id: userId,
    })
    return ["creator", "administrator", "member"].includes(member?.status)
  } catch (error) {
    // If bot is not admin in channel, don't block user permanently
    return true
  }
}

// ==========================================
// 3. TO'LOV KARTALARI VA TARIFLAR
// ==========================================
export type PaymentCard = {
  id: string
  bankName: string
  cardNumber: string
  cardHolder: string
  paymentType: "Uzcard" | "Humo" | "Click" | "Payme"
  active: boolean
}

let globalCards: PaymentCard[] = [
  {
    id: "card-1",
    bankName: "Kapitalbank (Uzcard)",
    cardNumber: "8600 4912 3456 7890",
    cardHolder: "SARDOR TUYGINOV",
    paymentType: "Uzcard",
    active: true,
  },
  {
    id: "card-2",
    bankName: "TBC Bank (Humo)",
    cardNumber: "9860 1201 9876 5432",
    cardHolder: "SARDOR TUYGINOV",
    paymentType: "Humo",
    active: true,
  },
]

export function getPaymentCards(): PaymentCard[] {
  return globalCards
}

export function addPaymentCard(card: Omit<PaymentCard, "id">): PaymentCard {
  const newCard: PaymentCard = {
    ...card,
    id: `card-${Date.now()}`,
  }
  globalCards.push(newCard)
  return newCard
}

export function toggleCardActive(id: string): boolean {
  const card = globalCards.find((c) => c.id === id)
  if (!card) return false
  card.active = !card.active
  return true
}

export function removePaymentCard(id: string): boolean {
  globalCards = globalCards.filter((c) => c.id !== id)
  return true
}

export type SubscriptionPlan = {
  id: string
  name: string
  durationDays: number
  amountUzs: number
  features: string[]
  popular?: boolean
}

let globalPlans: SubscriptionPlan[] = [
  {
    id: "plan-1d",
    name: "1 kunlik VIP Pass",
    durationDays: 1,
    amountUzs: 3000,
    features: ["1 kunlik cheksiz 4K tomosha", "Reklamalarsiz pleyer", "Barcha kinolar & animelar", "Telegram bot va saytda faol"],
  },
  {
    id: "plan-1w",
    name: "1 haftalik VIP Express",
    durationDays: 7,
    amountUzs: 9000,
    features: ["7 kunlik cheksiz kirish", "4K Ultra HD video", "Reklamalarsiz tezkor pleyer", "Barcha premyera seriallar"],
  },
  {
    id: "plan-1m",
    name: "1 oylik VIP Premium",
    durationDays: 30,
    amountUzs: 25000,
    popular: true,
    features: ["30 kunlik to'liq VIP obuna", "Anime & Kino premyeralar", "Kanal & guruh talabisiz", "VIP nishoni va 24/7 yordam"],
  },
  {
    id: "plan-1y",
    name: "1 yillik MAX Cheksiz",
    durationDays: 365,
    amountUzs: 120000,
    features: ["Barcha 4K kinolar & Animelar", "Eksklyuziv seriallar", "Kanal & guruh talabisiz", "VIP nishoni va yopiq guruh"],
  },
]

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return globalPlans
}

// ==========================================
// 4. QO'LDA CHEK TEKSHIRISH (MANUAL RECEIPTS)
// ==========================================
export type ManualReceipt = {
  id: string
  userId: string
  userDisplayName: string
  userTelegram?: string
  userEmail?: string
  planId: string
  planName: string
  amountUzs: number
  cardNumber: string
  receiptImageUrl: string
  transactionNote?: string
  status: "pending" | "approved" | "rejected"
  adminNote?: string
  createdAt: string
  reviewedAt?: string
}

let globalReceipts: ManualReceipt[] = [
  {
    id: "rc-101",
    userId: "usr-tg-1",
    userDisplayName: "Sardor Tuyginov",
    userTelegram: "@sardortuyginov",
    userEmail: "tuyginovsardor4@gmail.com",
    planId: "plan-3m",
    planName: "3 oylik VIP Premyera",
    amountUzs: 39000,
    cardNumber: "8600 4912 3456 7890",
    receiptImageUrl: "/images/poster-1.png",
    transactionNote: "Payme orqali to'landi. Tranzaksiya: #9834120",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
]

export function getManualReceipts(): ManualReceipt[] {
  return globalReceipts
}

export function submitManualReceipt(receipt: Omit<ManualReceipt, "id" | "status" | "createdAt">): ManualReceipt {
  const newReceipt: ManualReceipt = {
    ...receipt,
    id: `rc-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  globalReceipts.unshift(newReceipt)
  return newReceipt
}

export async function reviewReceipt(id: string, status: "approved" | "rejected", adminNote?: string): Promise<boolean> {
  const receipt = globalReceipts.find((r) => r.id === id)
  if (!receipt) return false
  receipt.status = status
  receipt.adminNote = adminNote || ""
  receipt.reviewedAt = new Date().toISOString()

  // If user has telegram username or ID, notify them via bot
  if (receipt.userTelegram) {
    try {
      const msg = status === "approved"
        ? `🎉 <b>Tabriklaymiz! To'lovingiz tasdiqlandi.</b>\n\nSizga <b>«${receipt.planName}»</b> tarifi muvaffaqiyatli yoqildi!\nEndi barcha film va animelarni 4K sifatda tomosha qilishingiz mumkin.`
        : `⚠️ <b>To'lovingiz rad etildi.</b>\n\nSabab: ${adminNote || "Chek ma'lumotlari mos kelmadi"}\nIltimos, qaytadan urinib ko'ring yoki adminga murojaat qiling.`
      await sendTelegramMessage(receipt.userTelegram, msg)
    } catch {
      // ignore
    }
  }

  return true
}

// ==========================================
// 5. E'LONLAR VA YANGILIKLAR (BROADCASTS)
// ==========================================
export type BroadcastPost = {
  id: string
  title: string
  message: string
  imageUrl?: string
  buttonText?: string
  buttonUrl?: string
  createdAt: string
  sentCount: number
}

let globalBroadcasts: BroadcastPost[] = [
  {
    id: "bc-1",
    title: "OneMedia yangi 4K serverlar ishga tushdi!",
    message: "Hurmatli foydalanuvchilar! Endi barcha premyera kinolar va animelar to'xtovsiz, yuqori tezlikda ochiladi!",
    buttonText: "🎬 Kinolarga o'tish",
    buttonUrl: "https://onemedia-mocha.vercel.app/catalog",
    createdAt: new Date().toISOString(),
    sentCount: 1420,
  },
]

export function getBroadcasts(): BroadcastPost[] {
  return globalBroadcasts
}

export function createBroadcast(post: Omit<BroadcastPost, "id" | "createdAt" | "sentCount">): BroadcastPost {
  const newPost: BroadcastPost = {
    ...post,
    id: `bc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sentCount: 0,
  }
  globalBroadcasts.unshift(newPost)
  return newPost
}
