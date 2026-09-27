'use server'

import { clearUserSessionCookie } from "@/lib/user-session"
import { clearAdminSessionCookie } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export async function logoutUserAction() {
  await clearUserSessionCookie()
  await clearAdminSessionCookie()
  redirect("/sign-in")
}
