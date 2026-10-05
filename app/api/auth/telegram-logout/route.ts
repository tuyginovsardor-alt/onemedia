import { NextResponse } from "next/server"
import { clearUserSessionCookie } from "@/lib/user-session"
import { clearAdminSessionCookie } from "@/lib/admin-auth"

export async function POST() {
  await clearUserSessionCookie()
  await clearAdminSessionCookie()
  return NextResponse.json({ success: true })
}
