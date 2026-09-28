import { NextResponse } from "next/server"
import { createTelegramLoginToken } from "@/lib/telegram-auth-store"

export async function POST() {
  const token = createTelegramLoginToken()
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "onemediahd_bot"
  const botUrl = `https://t.me/${botUsername.replace("@", "")}?start=login_${token}`
  return NextResponse.json({ token, botUrl })
}
