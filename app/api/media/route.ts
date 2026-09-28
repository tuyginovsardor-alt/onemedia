import { NextResponse } from "next/server"
import { fetchAllMediaFromNeon } from "@/lib/db/media-db"
import { movies } from "@/lib/movies"
import { setAllMedia } from "@/lib/anime-store"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const neonItems = await fetchAllMediaFromNeon()
    if (neonItems.length > 0) {
      setAllMedia(neonItems)
    }
    return NextResponse.json({
      success: true,
      media: neonItems,
      staticMovies: movies,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
