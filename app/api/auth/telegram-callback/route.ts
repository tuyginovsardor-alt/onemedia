import { NextRequest, NextResponse } from "next/server"
import { getPendingTelegramTokenStatus } from "@/lib/telegram-auth-store"
import { setUserSessionCookie } from "@/lib/user-session"
import { setAdminSessionCookie } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const baseUrl = new URL("/", request.url)

  if (token) {
    const session = getPendingTelegramTokenStatus(token)
    if (session?.status === "authenticated" && session.user) {
      await setUserSessionCookie(session.user)
      if (session.user.role === "admin") {
        await setAdminSessionCookie(`tg-${session.user.telegramId}`, "super_admin")
      }
      return NextResponse.redirect(new URL("/profile", request.url))
    }
  }

  return NextResponse.redirect(baseUrl)
}
