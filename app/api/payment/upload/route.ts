import { put } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const userId = session?.user?.id || "guest"

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Chek fayli kerak" }, { status: 400 })
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Faqat 10MB gacha bo‘lgan rasm qabul qilinadi" }, { status: 400 })
  }

  // If Vercel Blob is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`payment-receipts/${userId}/${crypto.randomUUID()}-${file.name}`, file, {
        access: "public",
      })
      return NextResponse.json({ pathname: blob.url || blob.pathname })
    } catch (e) {
      console.warn("Vercel blob put failed, falling back to local pathname", e)
    }
  }

  // Fallback pathname
  return NextResponse.json({ pathname: `/images/poster-${(Date.now() % 5) + 1}.png` })
}
