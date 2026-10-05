import { saveMediaItemToNeon } from "@/lib/db/media-db"
import { addMediaItem, type MediaItem } from "@/lib/anime-store"
import { sendTelegramMessage, editTelegramMessageText } from "@/lib/telegram"

export type WizardStep =
  | "awaiting_title"
  | "awaiting_poster"
  | "awaiting_video"
  | "awaiting_season_episodes"
  | "awaiting_dubbing"
  | "awaiting_synopsis"

export type AnimeWizardState = {
  chatId: number
  type: "anime" | "movie"
  step: WizardStep
  data: {
    title?: string
    originalTitle?: string
    posterUrl?: string
    posterFileId?: string
    telegramFileId?: string
    year?: number
    rating?: number
    quality?: "4K" | "FHD" | "HD"
    genres?: string[]
    season?: number
    totalEpisodes?: number
    dubbingStudio?: string
    synopsis?: string
    duration?: string
  }
  updatedAt: number
}

// In-memory state store for bot chat sessions
const chatWizards = new Map<number, AnimeWizardState>()

export function getWizardState(chatId: number): AnimeWizardState | undefined {
  const state = chatWizards.get(chatId)
  if (!state) return undefined
  // 1 hour expiry
  if (Date.now() - state.updatedAt > 3600000) {
    chatWizards.delete(chatId)
    return undefined
  }
  return state
}

export function startWizard(chatId: number, type: "anime" | "movie" = "anime"): AnimeWizardState {
  const state: AnimeWizardState = {
    chatId,
    type,
    step: "awaiting_title",
    data: {
      year: 2025,
      rating: 8.9,
      quality: "4K",
      genres: type === "anime" ? ["Anime", "Jangari", "Fantastika"] : ["Jangari", "Drama"],
      season: 1,
      totalEpisodes: type === "anime" ? 12 : 1,
      dubbingStudio: type === "anime" ? "AnimeDub" : "OneMedia Dublyaj",
      duration: type === "anime" ? "24 daq" : "1h 50m",
    },
    updatedAt: Date.now(),
  }
  chatWizards.set(chatId, state)
  return state
}

export function updateWizardState(chatId: number, updates: Partial<AnimeWizardState>): AnimeWizardState | undefined {
  const current = getWizardState(chatId)
  if (!current) return undefined
  const next = {
    ...current,
    ...updates,
    data: { ...current.data, ...updates.data },
    updatedAt: Date.now(),
  }
  chatWizards.set(chatId, next)
  return next
}

export function clearWizardState(chatId: number) {
  chatWizards.delete(chatId)
}

// Complete the wizard and write directly to Neon PostgreSQL
export async function finalizeWizard(chatId: number): Promise<MediaItem | null> {
  const state = getWizardState(chatId)
  if (!state || !state.data.title) return null

  const d = state.data
  const title = d.title.trim()
  const mediaType = state.type

  const episodes = []
  if (mediaType === "anime") {
    const total = d.totalEpisodes || 12
    for (let i = 1; i <= Math.min(total, 24); i++) {
      episodes.push({
        id: `ep-${i}`,
        episodeNumber: i,
        title: `${i}-qism`,
        duration: "24 daq",
        quality: (d.quality === "4K" ? "4K" : "1080p") as "4K" | "1080p",
        telegramFileId: i === 1 ? d.telegramFileId : undefined,
        posterFileId: d.posterFileId || undefined,
      })
    }
  } else {
    episodes.push({
      id: "ep-1",
      episodeNumber: 1,
      title: "To'liq film",
      duration: d.duration || "1h 50m",
      quality: (d.quality === "4K" ? "4K" : "1080p") as "4K" | "1080p",
      telegramFileId: d.telegramFileId || undefined,
      posterFileId: d.posterFileId || undefined,
    })
  }

  const saved = await saveMediaItemToNeon({
    title,
    originalTitle: d.originalTitle,
    type: mediaType,
    year: d.year || 2025,
    rating: d.rating || 8.9,
    duration: d.duration || (mediaType === "anime" ? "24 daq" : "1h 50m"),
    ageRating: "16+",
    country: mediaType === "anime" ? "Yaponiya" : "AQSH",
    language: "O'zbekcha (Dublyaj)",
    genres: d.genres && d.genres.length > 0 ? d.genres : ["Anime", "Jangari"],
    poster: d.posterUrl || (d.posterFileId ? `/api/telegram/file-proxy?fileId=${d.posterFileId}` : "/images/poster-1.png"),
    posterFileId: d.posterFileId,
    backdrop: d.posterUrl || (d.posterFileId ? `/api/telegram/file-proxy?fileId=${d.posterFileId}` : "/images/poster-1.png"),
    synopsis: d.synopsis || `${title} — OneMedia platformasida 4K sifatda tomosha qiling.`,
    director: mediaType === "anime" ? "Anime Studio" : "OneMedia Studio",
    cast: ["OneMedia Ijodiy Guruhi"],
    quality: d.quality || "4K",
    featured: true,
    totalEpisodes: episodes.length,
    season: d.season || 1,
    animeStatus: "completed",
    dubbingStudio: d.dubbingStudio || "AnimeDub",
    telegramStorageId: d.telegramFileId,
    episodes,
  })

  addMediaItem(saved)
  clearWizardState(chatId)
  return saved
}
