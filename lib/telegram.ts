import { createHash } from "node:crypto"

const token = process.env.TELEGRAM_BOT_TOKEN

function requireToken() {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured")
  return token
}

export const telegramWebhookSecret = token ? createHash("sha256").update(token).digest("hex").slice(0, 64) : ""

export async function telegramApi<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${requireToken()}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  const result = await response.json()
  if (!response.ok || !result.ok) throw new Error(result.description || "Telegram request failed")
  return result.result as T
}

export type TelegramWebhookInfo = {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
}
