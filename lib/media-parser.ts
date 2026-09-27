export type ParsedMedia = {
  title: string
  type: "movie" | "anime" | "series"
  year: number
  rating: number
  duration: string
  quality: "4K" | "FHD" | "HD"
  genres: string[]
  synopsis: string
  fileId?: string
  posterUrl?: string
  totalEpisodes?: number
}

export function parseTelegramMediaPost(text: string, fileId?: string): ParsedMedia {
  const clean = text.trim()
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean)

  let title = ""
  let year = new Date().getFullYear()
  let rating = 8.5
  let duration = "1h 50m"
  let quality: "4K" | "FHD" | "HD" = "4K"
  let genres: string[] = []
  let synopsis = ""
  let type: "movie" | "anime" | "series" = "movie"
  let totalEpisodes = 1

  // Detect Anime keywords
  if (
    clean.toLowerCase().includes("anime") ||
    clean.toLowerCase().includes("manga") ||
    clean.toLowerCase().includes("qism") ||
    clean.toLowerCase().includes("mavsum")
  ) {
    type = "anime"
  }

  // 1. Title extraction
  const titleMatch = clean.match(/(?:🎬|🍿|🎥|🎞️)?\s*(?:Nomi|Nom|Film|Kino|Anime|Title)?\s*[:—\-]?\s*([^\n\r(]+)/i)
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/^[🎬🍿🎥🎞️\s:—\-]+/, "").trim()
  } else if (lines.length > 0) {
    title = lines[0].replace(/^[🎬🍿🎥🎞️\s:—\-]+/, "").replace(/\(\d{4}\).*/, "").trim()
  }

  // If still empty or generic
  if (!title || title.length < 2) {
    title = "Yangi Premyera"
  }

  // 2. Year extraction (e.g. 2025, 2024, (2025))
  const yearMatch = clean.match(/\b(202[0-9]|201[0-9]|200[0-9]|199[0-9])\b/)
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10)
  }

  // 3. Rating extraction (e.g. ⭐ 8.7, 8.5/10, IMDb: 8.2)
  const ratingMatch = clean.match(/(?:⭐|imdb|reyting|bahosi)?\s*[:—\-]?\s*([0-9](\.[0-9])?)\s*(?:\/\s*10)?/i)
  if (ratingMatch && ratingMatch[1]) {
    const val = parseFloat(ratingMatch[1])
    if (val >= 1 && val <= 10) rating = val
  }

  // 4. Quality extraction
  if (/4k|ultra\s*hd/i.test(clean)) {
    quality = "4K"
  } else if (/1080p|fhd|full\s*hd/i.test(clean)) {
    quality = "FHD"
  } else if (/720p|hd/i.test(clean)) {
    quality = "HD"
  }

  // 5. Genres extraction
  const genresMatch = clean.match(/(?:🎭|Janr|Janrlar|Janri|Genre)?\s*[:—\-]?\s*([^\n\r]+)/i)
  if (genresMatch && genresMatch[1] && genresMatch[1].length > 3) {
    const raw = genresMatch[1].replace(/^[🎭\s:—\-]+/, "")
    genres = raw.split(/[,/|•]+/).map((g) => g.trim()).filter((g) => g.length > 1 && !g.toLowerCase().includes("janr"))
  }
  if (genres.length === 0) {
    genres = type === "anime" ? ["Anime", "Fantastika", "Jangari"] : ["Jangari", "Sarguzasht"]
  }

  // 6. Duration or episodes
  const durMatch = clean.match(/(?:⏳|Davomiyligi|Vaqt)?\s*[:—\-]?\s*(\d+\s*(?:h|soat|daq|min|m)[^\n\r]*)/i)
  if (durMatch && durMatch[1]) {
    duration = durMatch[1].replace(/^[⏳\s:—\-]+/, "").trim()
  }

  const epMatch = clean.match(/(?:Qismlar|Epizodlar)?\s*[:—\-]?\s*(\d+)\s*(?:ta\s*)?qism/i)
  if (epMatch && epMatch[1]) {
    totalEpisodes = parseInt(epMatch[1], 10)
    type = "anime"
  }

  // 7. File ID extraction from text if not provided directly
  let detectedFileId = fileId
  if (!detectedFileId) {
    const fidMatch = clean.match(/\b(BAAC[A-Za-z0-9_-]{20,})\b/)
    if (fidMatch) {
      detectedFileId = fidMatch[1]
    }
  }

  // 8. Synopsis
  const synMatch = clean.match(/(?:📝|Tavsif|Mazmuni|Syujet|Description)?\s*[:—\-]?\s*([\s\S]+?)(?:🍿|OneMedia|#|$)/i)
  if (synMatch && synMatch[1] && synMatch[1].trim().length > 15) {
    synopsis = synMatch[1].trim()
  } else {
    synopsis = lines.slice(1).join(" ").slice(0, 300) || `${title} — OneMedia platformasida 4K sifatda tomosha qiling.`
  }

  return {
    title,
    type,
    year,
    rating,
    duration,
    quality,
    genres,
    synopsis,
    fileId: detectedFileId,
    totalEpisodes,
  }
}

// In-memory Draft Store for Telegram forwards & uploads
export type MediaDraft = ParsedMedia & {
  id: string
  chatId: number | string
  createdAt: number
  photoFileId?: string
}

const mediaDrafts = new Map<string, MediaDraft>()

export function saveMediaDraft(draft: Omit<MediaDraft, "id" | "createdAt">): MediaDraft {
  const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const newDraft: MediaDraft = {
    ...draft,
    id,
    createdAt: Date.now(),
  }
  mediaDrafts.set(id, newDraft)
  return newDraft
}

export function getMediaDraft(id: string): MediaDraft | undefined {
  return mediaDrafts.get(id)
}

export function deleteMediaDraft(id: string): boolean {
  return mediaDrafts.delete(id)
}
