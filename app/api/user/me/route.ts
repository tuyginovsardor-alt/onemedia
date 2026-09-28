import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user-session"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
