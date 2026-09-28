import { createHash } from "node:crypto"

export const PRODUCTION_DOMAIN = "https://onemedia-mocha.vercel.app"

export function normalizeWebhookUrl(input?: string | null): string {
  if (!input) return `${PRODUCTION_DOMAIN}/api/telegram/webhook`
  let url = input.trim().replace(/\/+$/, "")
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`
  }
  while (url.endsWith("/api/telegram/webhook")) {
    url = url.slice(0, -"/api/telegram/webhook".length).replace(/\/+$/, "")
  }
  return `${url}/api/telegram/webhook`
}

export function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || ""
}

export function isTelegramConfigured(): boolean {
  return Boolean(getTelegramBotToken())
}

function requireToken(): string {
  const token = getTelegramBotToken()
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured in environment variables")
  return token
}

export const telegramWebhookSecret = getTelegramBotToken()
  ? createHash("sha256").update(getTelegramBotToken()).digest("hex").slice(0, 64)
  : ""

export async function telegramApi<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const token = requireToken()
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  const result = await response.json().catch(() => ({ ok: false, description: "Invalid JSON response" }))
  if (!response.ok || !result.ok) {
    throw new Error(result.description || `Telegram request failed for ${method}`)
  }
  return result.result as T
}

export type TelegramWebhookInfo = {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
  max_connections?: number
  allowed_updates?: string[]
}

export type TelegramBotUser = {
  id: number
  is_bot: boolean
  first_name: string
  username?: string
  can_join_groups?: boolean
  can_read_all_group_messages?: boolean
  supports_inline_queries?: boolean
}

export async function getBotMe(): Promise<TelegramBotUser | null> {
  if (!isTelegramConfigured()) return null
  try {
    return await telegramApi<TelegramBotUser>("getMe")
  } catch {
    return null
  }
}

export async function sendTelegramMessage(chatId: number | string, text: string, options?: {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
  reply_markup?: unknown
  disable_web_page_preview?: boolean
}) {
  return telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parse_mode || "HTML",
    disable_web_page_preview: options?.disable_web_page_preview ?? false,
    ...(options?.reply_markup ? { reply_markup: options.reply_markup } : {}),
  })
}

export async function sendTelegramPhoto(chatId: number | string, photoUrl: string, caption?: string, options?: {
  parse_mode?: "HTML" | "Markdown"
  reply_markup?: unknown
}) {
  try {
    return await telegramApi("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption || "",
      parse_mode: options?.parse_mode || "HTML",
      ...(options?.reply_markup ? { reply_markup: options.reply_markup } : {}),
    })
  } catch (error) {
    // If photo fetching fails (e.g. local URL), gracefully fallback to text message
    return sendTelegramMessage(chatId, caption || "", options)
  }
}

export async function answerTelegramCallbackQuery(callbackQueryId: string, text?: string, showAlert = false) {
  try {
    return await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text: text || "",
      show_alert: showAlert,
    })
  } catch {
    // ignore callback answering errors
  }
}

export async function editTelegramMessageText(chatId: number | string, messageId: number, text: string, options?: {
  parse_mode?: "HTML" | "Markdown"
  reply_markup?: unknown
  disable_web_page_preview?: boolean
}) {
  try {
    return await telegramApi("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: options?.parse_mode || "HTML",
      disable_web_page_preview: options?.disable_web_page_preview ?? false,
      ...(options?.reply_markup ? { reply_markup: options.reply_markup } : {}),
    })
  } catch (error) {
    // If edit fails (e.g. same text), send new message
    return sendTelegramMessage(chatId, text, options)
  }
}

export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  try {
    const token = getTelegramBotToken()
    if (!token || !fileId) return null
    const res = await telegramApi<{ file_path?: string }>("getFile", { file_id: fileId })
    if (res?.file_path) {
      return `https://api.telegram.org/file/bot${token}/${res.file_path}`
    }
    return null
  } catch {
    return null
  }
}

