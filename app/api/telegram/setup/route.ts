import { NextResponse } from "next/server"
import { configureTelegramWebhook, getTelegramWebhookInfo, getTelegramBotDetails, resolveCurrentSiteUrl } from "@/app/actions/telegram"
import { isTelegramConfigured } from "@/lib/telegram"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const action = url.searchParams.get("action")
  const customUrl = url.searchParams.get("url")

  const siteUrl = await resolveCurrentSiteUrl()
  const currentWebhookUrl = `${siteUrl}/api/telegram/webhook`
  const configured = isTelegramConfigured()

  if (action === "set") {
    try {
      const result = await configureTelegramWebhook(customUrl || currentWebhookUrl)
      return NextResponse.json({
        ok: true,
        message: "Webhook muvaffaqiyatli ulandi",
        webhookUrl: customUrl || currentWebhookUrl,
        result,
      })
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: (error as Error).message },
        { status: 500 }
      )
    }
  }

  const [info, bot] = await Promise.all([
    getTelegramWebhookInfo().catch(() => null),
    getTelegramBotDetails().catch(() => null),
  ])

  return NextResponse.json({
    ok: true,
    service: "onemedia-telegram-setup",
    configured,
    botUsername: bot?.username ? `@${bot.username}` : null,
    botName: bot?.first_name || null,
    detectedSiteUrl: siteUrl,
    suggestedWebhookUrl: currentWebhookUrl,
    currentWebhookInfo: info,
    instructions: {
      connectWebhookNow: `${siteUrl}/api/telegram/setup?action=set`,
      adminDashboard: `${siteUrl}/admin/telegram`,
    },
  })
}
