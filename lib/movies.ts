import { getAllMedia, getMediaById, type MediaItem } from "@/lib/anime-store"

export type Movie = {
  id: string
  title: string
  originalTitle?: string
  type?: "movie" | "anime" | "series"
  year: number
  rating: number
  duration: string
  ageRating: string
  country?: string
  language?: string
  genres: string[]
  poster: string
  posterFileId?: string
  backdrop: string
  trailerUrl?: string
  synopsis: string
  director: string
  cast: string[]
  quality: "4K" | "HD" | "FHD"
  featured?: boolean
  dubbingStudio?: string
  totalEpisodes?: number
  telegramStorageId?: string
}

// Proxy getter for backward compatibility that dynamically queries the live store
export const movies: Movie[] = new Proxy([] as Movie[], {
  get(target, prop, receiver) {
    const live = getAllMedia() as Movie[]
    if (prop === "length") return live.length
    if (typeof prop === "string" && !isNaN(Number(prop))) {
      return live[Number(prop)]
    }
    const val = (live as any)[prop]
    if (typeof val === "function") {
      return val.bind(live)
    }
    return Reflect.get(target, prop, receiver)
  },
})

export const genres = [
  "Barchasi",
  "Anime",
  "Jangari",
  "Fantastika",
  "Sarguzasht",
  "Komediya",
  "Drama",
  "Triller",
  "Multfilm",
  "Tarixiy",
  "Qo'rqinchli",
  "Melodrama",
  "Kriminal",
  "Detektiv",
  "Isekai",
  "Shounen",
]

export function getMovie(id: string): Movie | undefined {
  return (getMediaById(id) || getAllMedia().find((m) => m.id === id)) as Movie | undefined
}

export function getFeatured(): Movie[] {
  const all = getAllMedia() as Movie[]
  const featured = all.filter((m) => m.featured)
  if (featured.length > 0) return featured
  return all.slice(0, 6)
}

export function byGenre(genre: string): Movie[] {
  const all = getAllMedia() as Movie[]
  if (genre === "Barchasi") return all
  return all.filter((m) => m.genres && m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()))
}

export const rows: { title: string; ids: string[] }[] = [
  {
    title: "Siz uchun tavsiya",
    ids: [],
  },
  {
    title: "Trend bo'lganlar",
    ids: [],
  },
  {
    title: "Yangi kinolar & Anime",
    ids: [],
  },
]
