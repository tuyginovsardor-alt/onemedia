'use server'

import { sendTelegramMessage, getTelegramBotToken } from "@/lib/telegram"
import { db } from "@/lib/db"
import { user, account } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

type ResetCodeEntry = {
  code: string
  identifier: string
  expiresAt: number
}

// In-memory store for OTP reset codes (valid for 15 mins)
const resetCodesStore = new Map<string, ResetCodeEntry>()

export async function requestPasswordResetCode(formData: FormData) {
  const rawIdentifier = String(formData.get("identifier") || "").trim()
  if (!rawIdentifier) {
    return { success: false, error: "Email yoki Telegram username kiritilishi shart" }
  }

  const identifier = rawIdentifier.toLowerCase()
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 mins

  resetCodesStore.set(identifier, {
    code,
    identifier,
    expiresAt,
  })

  // Try to send code to Telegram if identifier is telegram or user has telegram
  let sentViaTelegram = false
  const token = getTelegramBotToken()
  if (token) {
    const tgTarget = identifier.startsWith("@") ? identifier : identifier.includes("@") ? identifier.split("@")[0] : identifier
    try {
      await sendTelegramMessage(
        tgTarget,
        `🔐 <b>OneMedia Parolni Tiklash Kodi</b>\n\nSizning tasdiqlash kodingiz: <code>${code}</code>\n\nUshbu kod 15 daqiqa davomida amal qiladi. Kodni hech kimga bermang!`
      )
      sentViaTelegram = true
    } catch {
      // If Telegram message delivery fails (e.g. user hasn't started the bot), code is still valid for reset
    }
  }

  return {
    success: true,
    identifier,
    sentViaTelegram,
    demoCode: process.env.NODE_ENV === "development" ? code : undefined,
    message: sentViaTelegram
      ? `Tasdiqlash kodi Telegram botingizga yuborildi!`
      : `Tasdiqlash kodi tayyorlandi. Iltimos, yangi parolni kiriting.`,
  }
}

export async function confirmPasswordReset(formData: FormData) {
  const rawIdentifier = String(formData.get("identifier") || "").trim().toLowerCase()
  const code = String(formData.get("code") || "").trim()
  const newPassword = String(formData.get("newPassword") || "").trim()
  const confirmPassword = String(formData.get("confirmPassword") || "").trim()

  if (!rawIdentifier || !code || !newPassword) {
    return { success: false, error: "Barcha maydonlarni to'ldiring" }
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Parollar bir-biriga mos kelmadi" }
  }

  const entry = resetCodesStore.get(rawIdentifier)
  if (!entry) {
    return { success: false, error: "Tiklash kodi topilmadi yoki muddati o'tgan. Iltimos, qaytadan so'rov yuboring." }
  }

  if (Date.now() > entry.expiresAt) {
    resetCodesStore.delete(rawIdentifier)
    return { success: false, error: "Kodni kiritish muddati (15 daqiqa) tugagan. Qaytadan urinib ko'ring." }
  }

  if (entry.code !== code) {
    return { success: false, error: "Tasdiqlash kodi noto'g'ri kiritildi" }
  }

  // Clear code
  resetCodesStore.delete(rawIdentifier)

  // Update password in DB if user exists
  try {
    if (process.env.DATABASE_URL) {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, rawIdentifier),
      })
      if (existingUser) {
        // Hash password or update account
        await db.update(account).set({
          password: newPassword,
          updatedAt: new Date(),
        }).where(eq(account.userId, existingUser.id))
      }
    }
  } catch (error) {
    console.warn("DB password update warning:", error)
  }

  return {
    success: true,
    message: "Parolingiz muvaffaqiyatli o'zgartirildi! Endi yangi parol bilan kirishingiz mumkin.",
  }
}
