import { NextResponse } from "next/server"
import { setUserSessionCookie, type UserSessionData } from "@/lib/user-session"
import { setAdminSessionCookie } from "@/lib/admin-auth"
import { isAuthorizedAdmin } from "@/lib/admin-store"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, first_name, last_name, username, photo_url } = body

    if (!id && !username && !first_name) {
      return NextResponse.json({ error: "Foydalanuvchi ma'lumotlari topilmadi" }, { status: 400 })
    }

    const tgId = id ? String(id) : `user-${Date.now()}`
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || username || "Telegram Foydalanuvchisi"
    const userEmail = username ? `${username}@telegram.org` : `tg_${tgId}@onemedia.uz`
    const isAdmin = isAuthorizedAdmin(username || tgId)

    const sessionData: UserSessionData = {
      id: `tg_${tgId}`,
      name: fullName,
      email: userEmail,
      username: username ? `@${username.replace("@", "")}` : undefined,
      image: photo_url || "/images/avatar.png",
      telegramId: tgId,
      role: isAdmin ? "admin" : "user",
      isVip: true,
      bio: "OneMedia kino portali foydalanuvchisi",
      location: "Toshkent, O'zbekiston",
    }

    await setUserSessionCookie(sessionData)

    // If user is an authorized admin, also authenticate for admin panels
    if (isAdmin) {
      await setAdminSessionCookie(`tg-${tgId}`, "super_admin")
    }

    return NextResponse.json({ success: true, user: sessionData, isAdmin })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Kirishda xatolik yuz berdi" }, { status: 500 })
  }
}
