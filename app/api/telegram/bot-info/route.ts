import { NextResponse } from "next/server"
import { getTelegramBotUsername, getBotMe, isTelegramConfigured } from "@/lib/telegram"

export async function GET() {
  const isConfigured = isTelegramConfigured()
  const botUser = await getBotMe()
  const username = await getTelegramBotUsername()

  return NextResponse.json({
    configured: isConfigured,
    username: username.replace(/^@/, ""),
    firstName: botUser?.first_name || "OneMedia Bot",
    id: botUser?.id,
  })
}
