import { put } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Chek fayli kerak" }, { status: 400 })
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Faqat 5MB gacha bo‘lgan rasm qabul qilinadi" }, { status: 400 })
  }

  const blob = await put(`payment-receipts/${session.user.id}/${crypto.randomUUID()}-${file.name}`, file, { access: "private" })
  return NextResponse.json({ pathname: blob.pathname })
}
