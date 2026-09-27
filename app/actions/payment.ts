'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { paymentRequest } from "@/lib/db/schema"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

const PLANS = { monthly: 49000, yearly: 399000 } as const

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function submitPayment(formData: FormData) {
  const userId = await getUserId()
  const plan = String(formData.get("plan")) as keyof typeof PLANS
  const transactionId = String(formData.get("transactionId") || "").trim()
  const receiptPathname = String(formData.get("receiptPathname") || "").trim()
  if (!(plan in PLANS) || !transactionId || !receiptPathname) throw new Error("To‘lov ma’lumotlari to‘liq emas")
  await db.insert(paymentRequest).values({ id: crypto.randomUUID(), userId, plan, amountUzs: PLANS[plan], transactionId, receiptPathname })
  revalidatePath("/payment")
  return { ok: true }
}

export async function getMyPayments() {
  const userId = await getUserId()
  return db.query.paymentRequest.findMany({ where: (row, { eq }) => eq(row.userId, userId), orderBy: (row, { desc }) => [desc(row.createdAt)] })
}
