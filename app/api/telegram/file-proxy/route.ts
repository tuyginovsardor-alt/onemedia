import { NextRequest, NextResponse } from "next/server"
import { getTelegramFileUrl } from "@/lib/telegram"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get("fileId")

  if (!fileId) {
    return NextResponse.redirect(new URL("/images/poster-1.png", request.url))
  }

  try {
    const fileUrl = await getTelegramFileUrl(fileId)
    if (fileUrl) {
      return NextResponse.redirect(fileUrl)
    }
  } catch {
    // fallback
  }

  return NextResponse.redirect(new URL("/images/poster-1.png", request.url))
}
