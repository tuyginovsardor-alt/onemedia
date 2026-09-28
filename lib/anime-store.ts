export type Episode = {
  id: string
  episodeNumber: number
  title: string
  duration: string
  telegramFileId?: string // Telegram file_id (e.g. BAACAgIAAxkBA...)
  posterFileId?: string
  telegramStorageChannelId?: string
  videoUrl?: string
  quality: "4K" | "1080p" | "720p"
}

export type MediaItem = {
  id: string
  type: "anime" | "movie" | "series"
  title: string
  originalTitle?: string
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
  quality: "4K" | "FHD" | "HD"
  featured?: boolean
  totalEpisodes?: number
  season?: number
  animeStatus?: "ongoing" | "completed"
  dubbingStudio?: string
  episodes: Episode[]
  telegramStorageId?: string
  viewsCount?: number
  addedAt: string
}

// Global live store synced in memory
let globalMediaStore: MediaItem[] = []

export function getAllMedia(): MediaItem[] {
  return globalMediaStore
}

export function setAllMedia(items: MediaItem[]) {
  globalMediaStore = items
}

export function getMediaById(id: string): MediaItem | undefined {
  return globalMediaStore.find((m) => m.id === id)
}

export function getAnimeList(): MediaItem[] {
  return globalMediaStore.filter((m) => m.type === "anime")
}

export function getMoviesList(): MediaItem[] {
  return globalMediaStore.filter((m) => m.type === "movie" || m.type === "series")
}

export function addMediaItem(item: MediaItem | Omit<MediaItem, "id" | "addedAt">): MediaItem {
  const existingId = (item as MediaItem).id
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
  const id = existingId || `${slug || "media"}-${Date.now().toString(36).slice(-5)}`

  const newItem: MediaItem = {
    ...item,
    id,
    addedAt: (item as MediaItem).addedAt || new Date().toISOString(),
  }

  const existingIndex = globalMediaStore.findIndex((m) => m.id === id)
  if (existingIndex !== -1) {
    globalMediaStore[existingIndex] = newItem
  } else {
    globalMediaStore.unshift(newItem)
  }
  return newItem
}

export function updateMediaItem(id: string, updates: Partial<MediaItem>): MediaItem | null {
  const index = globalMediaStore.findIndex((m) => m.id === id)
  if (index === -1) return null
  globalMediaStore[index] = { ...globalMediaStore[index], ...updates }
  return globalMediaStore[index]
}

export function deleteMediaItem(id: string): boolean {
  const initialLen = globalMediaStore.length
  globalMediaStore = globalMediaStore.filter((m) => m.id !== id)
  return globalMediaStore.length < initialLen
}
