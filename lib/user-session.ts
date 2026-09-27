import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { isAuthorizedAdmin } from "@/lib/admin-store"

export type UserSessionData = {
  id: string
  name: string
  email: string
  username?: string
  image?: string
  telegramId?: number | string
  role: "admin" | "user"
  isVip: boolean
  bio?: string
  phone?: string
  location?: string
}

const USER_SESSION_COOKIE = "onemedia_user_session"

export async function getCurrentUser(reqHeaders?: Headers): Promise<UserSessionData | null> {
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(USER_SESSION_COOKIE)?.value

  // 1. Check custom Telegram / unified session cookie
  if (rawCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawCookie)) as UserSessionData
      return parsed
    } catch {
      // ignore
    }
  }

  // 2. Check Better-Auth session if headers provided
  if (reqHeaders) {
    try {
      const session = await auth.api.getSession({ headers: reqHeaders })
      if (session?.user) {
        const isAdmin = isAuthorizedAdmin(session.user.email)
        return {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || "/images/avatar.png",
          role: isAdmin ? "admin" : "user",
          isVip: true,
        }
      }
    } catch {
      // ignore
    }
  }

  return null
}

export async function setUserSessionCookie(userData: UserSessionData) {
  const cookieStore = await cookies()
  const value = encodeURIComponent(JSON.stringify(userData))
  cookieStore.set(USER_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearUserSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(USER_SESSION_COOKIE)
}
