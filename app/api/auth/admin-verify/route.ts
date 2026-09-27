import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSignature, setAdminSessionCookie } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get("uid")
  const ts = searchParams.get("ts")
  const sig = searchParams.get("sig")
  const target = searchParams.get("target") || "web"

  const destinationPath = target === "tg" ? "/admin/tg" : "/admin"

  if (uid && ts && sig) {
    const timestamp = parseInt(ts, 10)
    const isValid = !isNaN(timestamp) && verifyAdminSignature(uid, timestamp, sig, "super_admin")

    if (isValid) {
      // In a Route Handler, modifying cookies is native and fully supported
      await setAdminSessionCookie(`tg-${uid}`, "super_admin")
      return NextResponse.redirect(new URL(destinationPath, request.url))
    }
  }

  // If signature check failed or parameters missing, redirect to destination
  return NextResponse.redirect(new URL(`${destinationPath}?auth_error=invalid_signature`, request.url))
}
