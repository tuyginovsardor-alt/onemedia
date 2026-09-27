'use server'

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { telegramApi, telegramWebhookSecret, type TelegramWebhookInfo } from "@/lib/telegram"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !process.env.ADMIN_EMAIL || session.user.email !== process.env.ADMIN_EMAIL) throw new Error("Unauthorized")
}

function getWebhookUrl() {
  const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL || "https://onemedia-web-site-creation-2.vercel.app"
  return `${origin}/api/telegram/webhook`
}

export async function configureTelegramWebhook() {
  await requireAdmin()
  await telegramApi("setWebhook", { url: getWebhookUrl(), secret_token: telegramWebhookSecret, allowed_updates: ["message", "callback_query"] })
  return
}

export async function removeTelegramWebhook() {
  await requireAdmin()
  await telegramApi("deleteWebhook", { drop_pending_updates: false })
  return
}

export async function getTelegramWebhookInfo(): Promise<TelegramWebhookInfo> {
  await requireAdmin()
  return telegramApi<TelegramWebhookInfo>("getWebhookInfo")
}
