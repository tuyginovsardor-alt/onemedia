import { notFound } from "next/navigation"
import { getMovie, movies } from "@/lib/movies"
import { getMediaById, addMediaItem, getAllMedia } from "@/lib/anime-store"
import { fetchMediaByIdFromNeon, fetchAllMediaFromNeon } from "@/lib/db/media-db"
import { FilmDetailsView } from "@/components/film-details-view"

export const dynamic = "force-dynamic"

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let movie = getMediaById(id) || getMovie(id)
  if (!movie) {
    const neonMedia = await fetchMediaByIdFromNeon(id)
    if (neonMedia) {
      addMediaItem(neonMedia)
      movie = neonMedia
    }
  }
  if (!movie) notFound()

  let allMedia = await fetchAllMediaFromNeon()
  if (allMedia.length === 0) {
    allMedia = getAllMedia()
  }

  const similar = allMedia
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .slice(0, 8)

  return <FilmDetailsView movie={movie} similarMovies={similar} />
}
