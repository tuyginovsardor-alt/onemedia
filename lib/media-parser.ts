export type ParsedMedia = {
  title: string
  originalTitle?: string
  type: "movie" | "anime" | "series"
  year: number
  rating: number
  duration: string
  quality: "4K" | "FHD" | "HD"
  genres: string[]
  synopsis: string
  fileId?: string
  photoFileId?: string
  posterUrl?: string
  totalEpisodes?: number
  season?: number
  dubbingStudio?: string
  country?: string
  ageRating?: string
  director?: string
}

export function parseTelegramMediaPost(text: string, fileId?: string, photoFileId?: string): ParsedMedia {
  const clean = text.trim()
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean)

  let title = ""
  let originalTitle = ""
  let year = new Date().getFullYear()
  let rating = 8.8
  let duration = "1h 50m"
  let quality: "4K" | "FHD" | "HD" = "4K"
  let genres: string[] = []
  let synopsis = ""
  let type: "movie" | "anime" | "series" = "movie"
  let totalEpisodes = 1
  let season = 1
  let dubbingStudio = "OneMedia Dublyaj"
  let country = "AQSH (Hollywood)"
  let ageRating = "16+"
  let director = "OneMedia Studio"

  // Detect Anime / Series keywords
  const lower = clean.toLowerCase()
  if (
    lower.includes("anime") ||
    lower.includes("manga") ||
    lower.includes("isekai") ||
    lower.includes("shounen") ||
    lower.includes("animesi") ||
    lower.includes("animedub") ||
    lower.includes("uzanime") ||
    lower.includes("silkroad")
  ) {
    type = "anime"
    country = "Yaponiya"
    dubbingStudio = "AnimeDub"
    duration = "24 daq"
    totalEpisodes = 12
  } else if (lower.includes("serial") || lower.includes("qism") || lower.includes("mavsum")) {
    type = "series"
    totalEpisodes = 8
  }

  // 1. Season & Episode Detection
  const seasonMatch = clean.match(/(\d+)\s*[-_ ]*mavsum/i)
  if (seasonMatch) {
    season = parseInt(seasonMatch[1], 10)
  }
  const epMatch = clean.match(/(?:(\d+)\s*(?:ta\s*)?qism|(\d+)\s*episodes?)/i)
  if (epMatch) {
    totalEpisodes = parseInt(epMatch[1] || epMatch[2], 10)
  }

  // 2. Title extraction
  const titleMatch = clean.match(/(?:🎬|🍿|🎥|🎞️|🎭)?\s*(?:Nomi|Nom|Film|Kino|Anime|Title)?\s*[:—\-]?\s*([^\n\r(|]+)/i)
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/^[🎬🍿🎥🎞️🎭\s:—\-]+/, "").trim()
  } else if (lines.length > 0) {
    title = lines[0].replace(/^[🎬🍿🎥🎞️🎭\s:—\-]+/, "").replace(/\(\d{4}\).*/, "").trim()
  }

  // Clean title from extra prefixes/suffixes
  title = title
    .replace(/^anime\s*[:—\-]/i, "")
    .replace(/^film\s*[:—\-]/i, "")
    .replace(/^kino\s*[:—\-]/i, "")
    .trim()

  if (!title || title.length < 2) {
    title = type === "anime" ? "Yangi Anime Premyera" : "Yangi Film Premyera"
  }

  // 3. Year extraction (e.g. 2025, 2026, 2024)
  const yearMatch = clean.match(/\b(202[0-9]|201[0-9]|200[0-9]|199[0-9])\b/)
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10)
  }

  // 4. Rating extraction (e.g. ⭐ 8.7, 8.5/10, IMDb: 8.2)
  const ratingMatch = clean.match(/(?:⭐|imdb|reyting|bahosi)?\s*[:—\-]?\s*([0-9](\.[0-9])?)\s*(?:\/\s*10)?/i)
  if (ratingMatch && ratingMatch[1]) {
    const val = parseFloat(ratingMatch[1])
    if (val >= 1 && val <= 10) rating = val
  }

  // 5. Dubbing Studio
  const dubMatch = clean.match(/(?:🎙️|Dublyaj|Tarjima|O'zbekcha|Studio)?\s*[:—\-]?\s*([^\n\r|•]+)/i)
  if (dubMatch && dubMatch[1] && dubMatch[1].length > 2) {
    const dVal = dubMatch[1].trim()
    if (!dVal.toLowerCase().includes("bor") && !dVal.toLowerCase().includes("yo'q")) {
      dubbingStudio = dVal
    }
  }

  // 6. Quality extraction
  if (/4k|ultra\s*hd/i.test(clean)) {
    quality = "4K"
  } else if (/1080p|fhd|full\s*hd/i.test(clean)) {
    quality = "FHD"
  } else if (/720p|hd/i.test(clean)) {
    quality = "HD"
  }

  // 7. Genres extraction
  const genresMatch = clean.match(/(?:🎭|Janr|Janrlar|Janri|Genre)?\s*[:—\-]?\s*([^\n\r|]+)/i)
  if (genresMatch && genresMatch[1] && genresMatch[1].length > 3) {
    const raw = genresMatch[1].replace(/^[🎭\s:—\-]+/, "")
    genres = raw
      .split(/[,/|•]+/)
      .map((g) => g.trim())
      .filter((g) => g.length > 1 && !g.toLowerCase().includes("janr") && !g.toLowerCase().includes("sifat"))
  }
  if (genres.length === 0) {
    genres = type === "anime" ? ["Anime", "Fantastika", "Jangari"] : ["Jangari", "Sarguzasht", "Drama"]
  }

  // 8. Duration
  const durMatch = clean.match(/(?:⏳|Davomiyligi|Vaqt)?\s*[:—\-]?\s*(\d+\s*(?:h|soat|daq|min|m)[^\n\r]*)/i)
  if (durMatch && durMatch[1]) {
    duration = durMatch[1].replace(/^[⏳\s:—\-]+/, "").trim()
  }

  // 9. File ID extraction from text if not provided directly
  let detectedVideoFileId = fileId && !fileId.startsWith("AgAC") ? fileId : undefined
  if (!detectedVideoFileId) {
    const fidMatch = clean.match(/\b(BAAC[A-Za-z0-9_-]{20,}|BAAD[A-Za-z0-9_-]{20,}|CQAC[A-Za-z0-9_-]{20,})\b/)
    if (fidMatch) {
      detectedVideoFileId = fidMatch[1]
    }
  }

  let detectedPhotoFileId = photoFileId || (fileId && fileId.startsWith("AgAC") ? fileId : undefined)
  if (!detectedPhotoFileId) {
    const pidMatch = clean.match(/\b(AgAC[A-Za-z0-9_-]{20,})\b/)
    if (pidMatch) {
      detectedPhotoFileId = pidMatch[1]
    }
  }

  // 10. Synopsis
  const synMatch = clean.match(/(?:📝|Tavsif|Mazmuni|Syujet|Description)?\s*[:—\-]?\s*([\s\S]+?)(?:🍿|OneMedia|#|$)/i)
  if (synMatch && synMatch[1] && synMatch[1].trim().length > 15) {
    synopsis = synMatch[1].trim()
  } else {
    synopsis = lines.slice(1).join(" ").slice(0, 300) || `${title} — OneMedia platformasida 4K sifatda tomosha qiling.`
  }

  return {
    title,
    originalTitle,
    type,
    year,
    rating,
    duration,
    quality,
    genres,
    synopsis,
    fileId: detectedVideoFileId,
    photoFileId: detectedPhotoFileId,
    totalEpisodes,
    season,
    dubbingStudio,
    country,
    ageRating,
    director,
  }
}

// In-memory Draft Store for Telegram forwards & uploads
export type MediaDraft = ParsedMedia & {
  id: string
  chatId: number | string
  createdAt: number
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
