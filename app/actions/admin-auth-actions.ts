'use server'

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  setAdminSessionCookie,
  clearAdminSessionCookie,
  verifyMasterAdminPassword,
  verifyAdminSignature,
} from "@/lib/admin-auth"
import { isAuthorizedAdmin } from "@/lib/admin-store"

export async function loginAdminWithPinAction(formData: FormData) {
  const pin = String(formData.get("pin") || "").trim()
  const returnUrl = String(formData.get("returnUrl") || "/admin").trim()

  if (!pin) {
    return { success: false, error: "Parol yoki PIN kiritilishi shart" }
  }

  const isValid = verifyMasterAdminPassword(pin)
  if (!isValid) {
    return { success: false, error: "Noto'g'ri PIN yoki parol kiritildi" }
  }

  // Set 30-day session cookie
  await setAdminSessionCookie("master-admin", "super_admin")

  revalidatePath(returnUrl)
  redirect(returnUrl)
}

export async function loginWithTelegramTokenAction(userId: string, timestamp: number, sig: string, returnUrl = "/admin/tg") {
  const valid = verifyAdminSignature(userId, timestamp, sig, "super_admin")
  if (!valid) {
    return { success: false, error: "SHA-256 xavfsizlik imzosi noto'g'ri yoki eskirgan" }
  }

  await setAdminSessionCookie(`tg-${userId}`, "super_admin")
  revalidatePath(returnUrl)
  redirect(returnUrl)
}

export async function logoutAdminAction(returnUrl = "/admin") {
  await clearAdminSessionCookie()
  revalidatePath(returnUrl)
  redirect(returnUrl)
}
