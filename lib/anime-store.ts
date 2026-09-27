import { movies, type Movie } from "@/lib/movies"

export type Episode = {
  id: string
  episodeNumber: number
  title: string
  duration: string
  telegramFileId?: string // Telegram file_id (e.g. BAACAgIAAxkBA...)
  telegramStorageChannelId?: string // Channel message id or link
  videoUrl?: string // Direct fallback MP4 / HLS URL
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
  genres: string[]
  poster: string
  backdrop: string
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
  addedAt: string
}

// Convert base movies to MediaItems with default episode
const baseMediaItems: MediaItem[] = movies.map((m) => ({
  ...m,
  type: m.genres.includes("Multfilm") ? ("anime" as const) : ("movie" as const),
  episodes: [
    {
      id: `${m.id}-ep1`,
      episodeNumber: 1,
      title: "To'liq film",
      duration: m.duration,
      quality: m.quality === "4K" ? "4K" : "1080p",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ],
  addedAt: "2025-01-01T00:00:00.000Z",
}))

// Add Top Anime Titles
const initialAnime: MediaItem[] = [
  {
    id: "solo-leveling",
    type: "anime",
    title: "Yolg'iz Daraja Ko'tarish (Solo Leveling)",
    originalTitle: "Ore dake Level Up na Ken",
    year: 2024,
    rating: 9.1,
    duration: "24 daq / qism",
    ageRating: "16+",
    genres: ["Anime", "Fantastika", "Jangari"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Insoniyatning eng zaif ovchisi Sung Jin-woo dahshatli ikki qavatli g'orda sirli 'Tizim'ga ega bo'ladi va dunyodagi eng qudratli ovchiga aylanadi.",
    director: "Shunsuke Nakashige",
    cast: ["Sung Jin-woo", "Cha Hae-in", "Go Gun-hee"],
    quality: "4K",
    featured: true,
    totalEpisodes: 12,
    episodes: [
      {
        id: "solo-leveling-ep1",
        episodeNumber: 1,
        title: "1-qism: Men o'rganishga ko'nikkanman",
        duration: "23:45",
        quality: "4K",
        telegramFileId: "BAACAgIAAxkBAAE_EXAMPLE_1",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      },
      {
        id: "solo-leveling-ep2",
        episodeNumber: 2,
        title: "2-qism: Agar yana bir imkoniyat bo'lsa",
        duration: "24:10",
        quality: "4K",
        telegramFileId: "BAACAgIAAxkBAAE_EXAMPLE_2",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
    ],
    addedAt: "2025-02-15T12:00:00.000Z",
  },
  {
    id: "demon-slayer-s4",
    type: "anime",
    title: "Ibislarni Mahv Etuvchi Qilich: Hashira Mashg'ulotlari",
    originalTitle: "Kimetsu no Yaiba: Hashira Geiko-hen",
    year: 2024,
    rating: 8.9,
    duration: "24 daq / qism",
    ageRating: "16+",
    genres: ["Anime", "Jangari", "Tarixiy"],
    poster: "/images/poster-3.png",
    backdrop: "/images/hero-3.png",
    synopsis: "Muzan Kibutsuji bilan bo'lajak hal qiluvchi jangga tayyorgarlik ko'rish uchun Tanjirou barcha kuchli ustunlar (Hashira) bilan qattiq mashg'ulotlarga kirishadi.",
    director: "Haruo Sotozaki",
    cast: ["Tanjiro Kamado", "Nezuko Kamado", "Giyu Tomioka"],
    quality: "4K",
    featured: true,
    totalEpisodes: 8,
    episodes: [
      {
        id: "ds-s4-ep1",
        episodeNumber: 1,
        title: "1-qism: Hashiralarning yig'ilishi",
        duration: "48:12",
        quality: "4K",
        telegramFileId: "BAACAgIAAxkBAAE_EXAMPLE_DS1",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      },
    ],
    addedAt: "2025-03-01T10:00:00.000Z",
  },
  {
    id: "jujutsu-kaisen-s2",
    type: "anime",
    title: "Sehrli Jang (Jujutsu Kaisen 2)",
    originalTitle: "Jujutsu Kaisen Season 2",
    year: 2023,
    rating: 9.0,
    duration: "24 daq / qism",
    ageRating: "18+",
    genres: ["Anime", "Jangari", "Triller"],
    poster: "/images/poster-5.png",
    backdrop: "/images/hero-2.png",
    synopsis: "Shibuya hodisasi boshlanadi! Gojo Satoru va uning talabalari la'natlangan ruhlarning mislsiz hujumiga qarshi shafqatsiz jangga kirishadilar.",
    director: "Shota Goshozono",
    cast: ["Gojo Satoru", "Yuji Itadori", "Megumi Fushiguro"],
    quality: "4K",
    featured: true,
    totalEpisodes: 23,
    episodes: [
      {
        id: "jjk-s2-ep1",
        episodeNumber: 1,
        title: "1-qism: Yashirin xazina",
        duration: "23:50",
        quality: "4K",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      },
    ],
    addedAt: "2025-01-20T10:00:00.000Z",
  },
]

let globalMediaStore: MediaItem[] = [...initialAnime, ...baseMediaItems]

export function getAllMedia(): MediaItem[] {
  return globalMediaStore
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

export function addMediaItem(item: Omit<MediaItem, "id" | "addedAt">): MediaItem {
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
  const id = `${slug}-${Date.now().toString(36).slice(-4)}`

  const newItem: MediaItem = {
    ...item,
    id,
    addedAt: new Date().toISOString(),
  }

  globalMediaStore.unshift(newItem)
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
