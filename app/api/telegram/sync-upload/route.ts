import { NextRequest, NextResponse } from "next/server"
import {
  createUploadSession,
  getUploadSession,
  updateUploadSession,
  clearUploadSession,
} from "@/lib/telegram-upload-sync"

// GET /api/telegram/sync-upload?session=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID talab qilinadi" }, { status: 400 })
  }

  const session = getUploadSession(sessionId)
  if (!session) {
    return NextResponse.json({ status: "not_found" }, { status: 404 })
  }

  return NextResponse.json({
    status: session.status,
    data: session,
  })
}

// POST /api/telegram/sync-upload (Create session)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { chatId } = body
    const session = createUploadSession(undefined, chatId)

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      botUrl: `https://t.me/onemediahd_bot?start=upload_${session.sessionId}`,
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
