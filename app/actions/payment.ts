'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { paymentRequest } from "@/lib/db/schema"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { submitManualReceipt, getManualReceipts } from "@/lib/admin-store"
import { sendTelegramMessage } from "@/lib/telegram"

const PLANS_MAP: Record<string, { name: string; amountUzs: number }> = {
  "plan-1d": { name: "1 kunlik VIP Pass", amountUzs: 3000 },
  "plan-1w": { name: "1 haftalik VIP Express", amountUzs: 9000 },
  "plan-1m": { name: "1 oylik VIP Premium", amountUzs: 25000 },
  "plan-1y": { name: "1 yillik MAX Cheksiz", amountUzs: 120000 },
  monthly: { name: "1 oylik VIP Premium", amountUzs: 25000 },
  yearly: { name: "1 yillik MAX Cheksiz", amountUzs: 120000 },
}

export async function submitPayment(formData: FormData) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)

  const planKey = String(formData.get("plan") || "plan-1m")
  const planInfo = PLANS_MAP[planKey] || PLANS_MAP["plan-1m"]
  const transactionId = String(formData.get("transactionId") || "").trim()
  const receiptPathname = String(formData.get("receiptPathname") || "/placeholder.jpg").trim()

  const userId = session?.user?.id || `user-guest-${Date.now()}`
  const userDisplayName = session?.user?.name || "OneMedia Foydalanuvchisi"
  const userEmail = session?.user?.email || "foydalanuvchi@onemedia.uz"

  // Always save to admin store so admins see it in /admin and /admin/tg
  const newReceipt = submitManualReceipt({
    userId,
    userDisplayName,
    userEmail,
    planId: planKey,
    planName: planInfo.name,
    amountUzs: planInfo.amountUzs,
    cardNumber: "Uzcard / Humo",
    receiptImageUrl: receiptPathname,
    transactionNote: `Tranzaksiya ID: ${transactionId}`,
  })

  // Instantly send Telegram alert to Admin
  try {
    const adminAlertMsg = `💳 <b>YANGI TO'LOV CHEKI YUBORILDI!</b>\n\n<b>Mijoz:</b> ${userDisplayName} (${userEmail})\n<b>Tarif:</b> «${planInfo.name}»\n<b>Summa:</b> ${planInfo.amountUzs.toLocaleString()} UZS\n<b>Tranzaksiya ID:</b> ${transactionId || "Ko'rsatilmadi"}\n\n👉 <a href="https://onemedia-mocha.vercel.app/admin">Admin Paneldan Tasdiqlash</a>`
    await sendTelegramMessage("8021115446", adminAlertMsg).catch(() => {})
  } catch {
    // ignore
  }

  // Try saving to postgres if connected
  try {
    if (process.env.DATABASE_URL) {
      await db.insert(paymentRequest).values({
        id: crypto.randomUUID(),
        userId,
        plan: planKey,
        amountUzs: planInfo.amountUzs,
        transactionId: transactionId || `TX-${Date.now()}`,
        receiptPathname,
      })
    }
  } catch (error) {
    console.warn("DB insert skipped or failed", error)
  }

  revalidatePath("/payment")
  revalidatePath("/admin")
  revalidatePath("/admin/tg")
  return { ok: true }
}

export async function getMyPayments() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)
  if (!session?.user) return []

  try {
    if (process.env.DATABASE_URL) {
      return await db.query.paymentRequest.findMany({
        where: (row, { eq }) => eq(row.userId, session.user.id),
        orderBy: (row, { desc }) => [desc(row.createdAt)],
      })
    }
  } catch {
    // fallback
  }

  return getManualReceipts().filter((r) => r.userEmail === session.user.email)
}
