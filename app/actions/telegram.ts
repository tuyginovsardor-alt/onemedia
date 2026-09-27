'use server'

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import {
  telegramApi,
  telegramWebhookSecret,
  type TelegramWebhookInfo,
  type TelegramBotUser,
  sendTelegramMessage,
  isTelegramConfigured,
} from "@/lib/telegram"

async function verifyAdminOrDev() {
  // If in development or no admin email explicitly required, permit configuration
  if (process.env.NODE_ENV === "development" && !process.env.ADMIN_EMAIL) {
    return
  }
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)
  if (process.env.ADMIN_EMAIL) {
    if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
      throw new Error("Ruxsat berilmagan: faqat admin foydalana oladi")
    }
  }
}

export async function resolveCurrentSiteUrl(): Promise<string> {
  const reqHeaders = await headers()
  const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host")
  const proto = reqHeaders.get("x-forwarded-proto") || "https"
  if (host) {
    return `${proto}://${host}`
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return "https://ais-dev-uutxhduathfxogfs6ag5we-30790122823.asia-east1.run.app"
}

export async function configureTelegramWebhook(targetUrl?: string) {
  await verifyAdminOrDev()
  const siteUrl = targetUrl?.trim() || (await resolveCurrentSiteUrl())
  const webhookUrl = targetUrl?.includes("/api/telegram/webhook")
    ? targetUrl.trim()
    : `${siteUrl.replace(/\/$/, "")}/api/telegram/webhook`

  const payload: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query", "inline_query"],
    drop_pending_updates: false,
  }

  if (telegramWebhookSecret) {
    payload.secret_token = telegramWebhookSecret
  }

  const result = await telegramApi<{ description?: string }>("setWebhook", payload)
  return { success: true, url: webhookUrl, result }
}

export async function removeTelegramWebhook() {
  await verifyAdminOrDev()
  await telegramApi("deleteWebhook", { drop_pending_updates: false })
  return { success: true }
}

export async function getTelegramWebhookInfo(): Promise<TelegramWebhookInfo | null> {
  if (!isTelegramConfigured()) return null
  try {
    return await telegramApi<TelegramWebhookInfo>("getWebhookInfo")
  } catch (error) {
    console.error("Failed to fetch webhook info", error)
    return null
  }
}

export async function getTelegramBotDetails(): Promise<TelegramBotUser | null> {
  if (!isTelegramConfigured()) return null
  try {
    return await telegramApi<TelegramBotUser>("getMe")
  } catch (error) {
    console.error("Failed to fetch bot details", error)
    return null
  }
}

export async function sendTestMessage(chatId: string, text: string) {
  await verifyAdminOrDev()
  if (!chatId || !text) throw new Error("Chat ID va xabar kiritilishi shart")
  return sendTelegramMessage(chatId, text)
}
