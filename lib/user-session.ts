import { cookies, headers } from "next/headers"
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

  let customUser: UserSessionData | null = null
  if (rawCookie) {
    try {
      customUser = JSON.parse(decodeURIComponent(rawCookie)) as UserSessionData
    } catch {
      // ignore
    }
  }

  // Check Better-Auth session
  let betterUser: UserSessionData | null = null
  try {
    const h = reqHeaders || (await headers())
    const session = await auth.api.getSession({ headers: h })
    if (session?.user) {
      const isAdmin = isAuthorizedAdmin(session.user.email)
      betterUser = {
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

  // Merge if both exist
  if (customUser && betterUser) {
    return {
      ...betterUser,
      ...customUser,
      name: customUser.name || betterUser.name,
      email: customUser.email || betterUser.email,
      image: customUser.image && customUser.image !== "/images/avatar.png" ? customUser.image : betterUser.image,
      telegramId: customUser.telegramId,
      username: customUser.username,
      role: customUser.role === "admin" || betterUser.role === "admin" ? "admin" : "user",
    }
  }

  return customUser || betterUser
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

