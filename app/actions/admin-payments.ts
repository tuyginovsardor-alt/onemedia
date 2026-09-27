'use server'

import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { paymentRequest, user } from "@/lib/db/schema"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !process.env.ADMIN_EMAIL || session.user.email !== process.env.ADMIN_EMAIL) throw new Error("Unauthorized")
  return session.user
}

export async function getPaymentRequests() {
  await requireAdmin()
  return db.select({ request: paymentRequest, email: user.email, name: user.name }).from(paymentRequest).leftJoin(user, eq(paymentRequest.userId, user.id)).orderBy(desc(paymentRequest.createdAt))
}

export async function updatePaymentStatus(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") || "")
  const status = String(formData.get("status") || "")
  const adminNote = String(formData.get("adminNote") || "")
  if (!id || (status !== "approved" && status !== "rejected")) throw new Error("Invalid payment update")
  await db.update(paymentRequest).set({ status, adminNote: adminNote.trim(), updatedAt: new Date() }).where(and(eq(paymentRequest.id, id), eq(paymentRequest.status, "pending")))
  revalidatePath("/admin/payments")
  revalidatePath("/payment")
}
