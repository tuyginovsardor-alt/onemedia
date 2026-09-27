import { get } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname) return NextResponse.json({ error: "Missing pathname" }, { status: 400 })
  const result = await get(pathname, { access: "private" })
  if (!result) return new NextResponse("Not found", { status: 404 })
  return new NextResponse(result.stream, { headers: { "Content-Type": result.blob.contentType || "application/octet-stream", "Cache-Control": "private, no-cache", ETag: result.blob.etag } })
}
