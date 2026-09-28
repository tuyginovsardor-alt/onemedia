import { setUserSessionCookie, type UserSessionData } from "@/lib/user-session"
import { setAdminSessionCookie } from "@/lib/admin-auth"
import { isAuthorizedAdmin } from "@/lib/admin-store"

export type PendingTelegramLogin = {
  token: string
  status: "pending" | "authenticated"
  user?: UserSessionData
  createdAt: number
}

const pendingLogins = new Map<string, PendingTelegramLogin>()

export function createTelegramLoginToken(): string {
  const token = `tgauth_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
  pendingLogins.set(token, {
    token,
    status: "pending",
    createdAt: Date.now(),
  })
  return token
}

export function markTelegramTokenAuthenticated(token: string, tgUser: {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}): UserSessionData | null {
  const session = pendingLogins.get(token)
  if (!session) return null

  const tgId = String(tgUser.id)
  const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || "Telegram Foydalanuvchisi"
  const userEmail = tgUser.username ? `${tgUser.username.replace("@", "")}@telegram.org` : `tg_${tgId}@onemedia.uz`
  const isAdmin = isAuthorizedAdmin(tgUser.username || tgId)

  const userData: UserSessionData = {
    id: `tg_${tgId}`,
    name: fullName,
    email: userEmail,
    username: tgUser.username ? `@${tgUser.username.replace("@", "")}` : undefined,
    image: tgUser.photo_url || "/images/avatar.png",
    telegramId: tgId,
    role: isAdmin ? "admin" : "user",
    isVip: true,
    bio: "OneMedia 4K kino va anime portali foydalanuvchisi",
    location: "Toshkent, O'zbekiston",
  }

  session.status = "authenticated"
  session.user = userData
  pendingLogins.set(token, session)
  return userData
}

export function getPendingTelegramTokenStatus(token: string): PendingTelegramLogin | null {
  const session = pendingLogins.get(token)
  if (!session) return null
  // Expire after 10 minutes
  if (Date.now() - session.createdAt > 600000) {
    pendingLogins.delete(token)
    return null
  }
  return session
}
