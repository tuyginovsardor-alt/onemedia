import { NextResponse } from "next/server"
import { telegramApi, telegramWebhookSecret } from "@/lib/telegram"

type TelegramUpdate = {
  update_id: number
  message?: { chat: { id: number | string }; text?: string; from?: { first_name?: string } }
}

async function sendMainMenu(chatId: number | string, firstName = "do‘st") {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text: `Assalomu alaykum, ${firstName}! OneMedia botiga xush kelibsiz.\n\nFilm va anime izlash uchun kerakli bo‘limni tanlang:`,
    reply_markup: {
      keyboard: [
        [{ text: "🎬 Kino izlash" }, { text: "🔥 Mashhur kinolar" }],
        [{ text: "📺 Seriallar" }, { text: "🎞️ Premyeralar" }],
        [{ text: "⭐ Sevimlilar" }, { text: "📥 Yuklab olish" }],
        [{ text: "🔎 Janrlar" }, { text: "🆕 Yangi kinolar" }],
        [{ text: "🌟 Top kinolar" }, { text: "ℹ️ Yordam" }],
      ],
      resize_keyboard: true,
      is_persistent: true,
    },
  })
}

async function handleUpdate(update: TelegramUpdate) {
  const message = update.message
  if (!message?.text) return
  const command = message.text.trim().toLowerCase()
  if (command === "/start" || command === "/menu" || command === "🏠 bosh menyu") {
    await sendMainMenu(message.chat.id, message.from?.first_name)
  } else if (command === "ℹ️ yordam" || command === "/help") {
    await telegramApi("sendMessage", { chat_id: message.chat.id, text: "Film qidirish uchun nomi yoki maxsus kodini yuboring. Menyu orqali janr va bo‘limlarni tanlashingiz mumkin." })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "telegram-webhook", configured: Boolean(telegramWebhookSecret) })
}

export async function POST(request: Request) {
  if (!telegramWebhookSecret || request.headers.get("x-telegram-bot-api-secret-token") !== telegramWebhookSecret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null
  if (!update) return NextResponse.json({ ok: false }, { status: 400 })

  await handleUpdate(update).catch((error) => {
    console.error("[v0] Telegram update handling failed", error)
  })
  return NextResponse.json({ ok: true })
}
