import { db, hasDatabaseUrl } from "./index"
import { media, mediaEpisode, type DbMedia, type DbMediaEpisode } from "./schema"
import { ensureDatabaseTables } from "./init"
import { eq, desc } from "drizzle-orm"
import type { MediaItem, Episode } from "@/lib/anime-store"

function mapDbMediaToMediaItem(row: DbMedia, episodes: DbMediaEpisode[] = []): MediaItem {
  const genresList = row.genres ? row.genres.split(",").map((g) => g.trim()).filter(Boolean) : ["Jangari"]
  const castList = row.cast ? row.cast.split(",").map((c) => c.trim()).filter(Boolean) : ["OneMedia"]

  const mappedEpisodes: Episode[] =
    episodes.length > 0
      ? episodes.map((ep) => ({
          id: ep.id,
          episodeNumber: ep.episodeNumber,
          title: ep.title,
          duration: ep.duration,
          telegramFileId: ep.telegramFileId || undefined,
          posterFileId: ep.posterFileId || undefined,
          videoUrl: ep.videoUrl || undefined,
          quality: ep.quality === "4K" ? "4K" : ep.quality === "720p" ? "720p" : "1080p",
        }))
      : [
          {
            id: `${row.id}-ep1`,
            episodeNumber: 1,
            title: row.type === "anime" ? "1-qism" : "To'liq film",
            duration: row.duration,
            telegramFileId: row.telegramStorageId || undefined,
            posterFileId: row.posterFileId || undefined,
            quality: row.quality === "4K" ? "4K" : "1080p",
          },
        ]

  return {
    id: row.id,
    type: (row.type as "anime" | "movie" | "series") || "movie",
    title: row.title,
    originalTitle: row.originalTitle || undefined,
    year: row.year || 2025,
    rating: parseFloat(row.rating || "8.5") || 8.5,
    duration: row.duration || "1h 50m",
    ageRating: row.ageRating || "16+",
    country: row.country || "AQSH",
    language: row.language || "O'zbekcha (Dublyaj)",
    genres: genresList,
    poster: row.posterUrl || (row.posterFileId ? `/api/telegram/file-proxy?fileId=${row.posterFileId}` : "/images/poster-1.png"),
    posterFileId: row.posterFileId || undefined,
    backdrop: row.backdropUrl || row.posterUrl || (row.posterFileId ? `/api/telegram/file-proxy?fileId=${row.posterFileId}` : "/images/poster-1.png"),
    trailerUrl: row.trailerUrl || undefined,
    synopsis: row.synopsis || `${row.title} — OneMedia platformasida 4K sifatda.`,
    director: row.director || "OneMedia Studio",
    cast: castList,
    quality: (row.quality as "4K" | "FHD" | "HD") || "4K",
    featured: Boolean(row.featured),
    totalEpisodes: row.totalEpisodes || 1,
    season: row.season || 1,
    animeStatus: (row.animeStatus as "ongoing" | "completed") || "completed",
    dubbingStudio: row.dubbingStudio || "OneMedia Dublyaj",
    telegramStorageId: row.telegramStorageId || undefined,
    viewsCount: row.viewsCount || 0,
    episodes: mappedEpisodes,
    addedAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  }
}

export async function fetchAllMediaFromNeon(): Promise<MediaItem[]> {
  if (!hasDatabaseUrl) return []
  try {
    await ensureDatabaseTables()
    const rows = await db.select().from(media).orderBy(desc(media.createdAt))
    const allEpisodes = await db.select().from(mediaEpisode)

    const episodeMap = new Map<string, DbMediaEpisode[]>()
    for (const ep of allEpisodes) {
      if (!episodeMap.has(ep.mediaId)) {
        episodeMap.set(ep.mediaId, [])
      }
      episodeMap.get(ep.mediaId)!.push(ep)
    }

    return rows.map((r) => mapDbMediaToMediaItem(r, episodeMap.get(r.id) || []))
  } catch (err) {
    console.error("Neon DB query error:", (err as Error).message)
    return []
  }
}

export async function fetchMediaByIdFromNeon(id: string): Promise<MediaItem | null> {
  if (!hasDatabaseUrl) return null
  try {
    await ensureDatabaseTables()
    const rows = await db.select().from(media).where(eq(media.id, id))
    if (rows.length === 0) return null
    const row = rows[0]
    const episodes = await db.select().from(mediaEpisode).where(eq(mediaEpisode.mediaId, id))
    return mapDbMediaToMediaItem(row, episodes)
  } catch (err) {
    console.error("Neon DB query by id error:", (err as Error).message)
    return null
  }
}

export async function saveMediaItemToNeon(item: Omit<MediaItem, "id" | "addedAt">): Promise<MediaItem> {
  await ensureDatabaseTables()

  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
  const id = `${slug || "media"}-${Date.now().toString(36).slice(-5)}`

  const genresStr = Array.isArray(item.genres) ? item.genres.join(", ") : String(item.genres || "Jangari")
  const castStr = Array.isArray(item.cast) ? item.cast.join(", ") : String(item.cast || "OneMedia")

  const newDbRow: DbMedia = {
    id,
    title: item.title,
    originalTitle: item.originalTitle || null,
    type: item.type || "movie",
    year: item.year || 2025,
    rating: item.rating ? item.rating.toString() : "8.5",
    duration: item.duration || "1h 50m",
    quality: item.quality || "4K",
    ageRating: item.ageRating || "16+",
    country: item.country || "AQSH",
    language: item.language || "O'zbekcha (Dublyaj)",
    genres: genresStr,
    posterUrl: item.poster || "",
    posterFileId: item.posterFileId || "",
    backdropUrl: item.backdrop || "",
    trailerUrl: item.trailerUrl || "",
    synopsis: item.synopsis || "",
    director: item.director || "",
    cast: castStr,
    dubbingStudio: item.dubbingStudio || "OneMedia Dublyaj",
    season: item.season || 1,
    animeStatus: item.animeStatus || "completed",
    totalEpisodes: item.totalEpisodes || (item.episodes?.length || 1),
    telegramStorageId: item.telegramStorageId || "",
    viewsCount: 0,
    featured: Boolean(item.featured),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.insert(media).values(newDbRow)

  if (item.episodes && item.episodes.length > 0) {
    const episodesToInsert = item.episodes.map((ep, idx) => ({
      id: `${id}-ep-${ep.episodeNumber || idx + 1}`,
      mediaId: id,
      episodeNumber: ep.episodeNumber || idx + 1,
      title: ep.title || `${idx + 1}-qism`,
      duration: ep.duration || "24 daq",
      telegramFileId: ep.telegramFileId || "",
      posterFileId: ep.posterFileId || "",
      videoUrl: ep.videoUrl || "",
      quality: ep.quality || "4K",
      createdAt: new Date(),
    }))

    for (const epRow of episodesToInsert) {
      await db.insert(mediaEpisode).values(epRow)
    }
  }

  return mapDbMediaToMediaItem(
    newDbRow,
    (item.episodes || []).map((e, idx) => ({
      id: `${id}-ep-${e.episodeNumber || idx + 1}`,
      mediaId: id,
      episodeNumber: e.episodeNumber || idx + 1,
      title: e.title || `${idx + 1}-qism`,
      duration: e.duration || "24 daq",
      telegramFileId: e.telegramFileId || null,
      posterFileId: e.posterFileId || null,
      videoUrl: e.videoUrl || null,
      quality: e.quality || "4K",
      createdAt: new Date(),
    }))
  )
}

export async function removeMediaItemFromNeon(id: string): Promise<boolean> {
  try {
    await ensureDatabaseTables()
    await db.delete(mediaEpisode).where(eq(mediaEpisode.mediaId, id))
    await db.delete(media).where(eq(media.id, id))
    return true
  } catch (err) {
    console.error("Failed to delete media from Neon DB:", err)
    return false
  }
}
