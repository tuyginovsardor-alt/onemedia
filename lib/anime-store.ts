export type CastMember = {
  name: string
  role: string
  photo?: string
}

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
  castMembers?: CastMember[]
  quality: "4K" | "FHD" | "HD"
  featured?: boolean
  totalEpisodes?: number
  season?: number
  animeStatus?: "ongoing" | "completed"
  dubbingStudio?: string
  episodes: Episode[]
  telegramStorageId?: string
  viewsCount?: number
  likesCount?: number
  dislikesCount?: number
  accessType?: "free" | "subscription"
  collectionCategory?: string
  addedAt: string
}

// Initial realistic seed items matching the design screenshots
const initialSeedMedia: MediaItem[] = [
  {
    id: "gyebek",
    type: "series",
    title: "GYEBEK",
    originalTitle: "Gyebaek (Gye Baek)",
    year: 2011,
    rating: 9.6,
    duration: "1 mavsum • 36 qism",
    ageRating: "12+",
    country: "Janubiy Koreya",
    language: "O'zbekcha (Dublyaj)",
    genres: ["Jangari", "Drama", "Harbiy", "Tarixiy"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    synopsis: "VII asrda Pekche qirolligi tobora kuchayib, o'z hududlarini kengaytirishga intilayotgan Silla qirolligi bilan to'qnashadi. Buyuk sarkarda Gyebaek vataniga sadoqat va Pekche qirolligini himoya qilish uchun hayotini janglarga bag'ishlaydi.",
    director: "Kim Geun-hong",
    cast: ["Lee Seo-jin", "Cho Jae-hyun", "Oh Yun-soo", "Song Ji-hyo"],
    castMembers: [
      { name: "Kim Geun-hong", role: "Produsser", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces" },
      { name: "Jeong Hyeong-so", role: "Senariy muallifi", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces" },
      { name: "Lee Seo-jin", role: "Bosh aktyor", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces" },
      { name: "Cho Jae-hyun", role: "Bosh aktyor", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=faces" },
    ],
    quality: "4K",
    featured: true,
    totalEpisodes: 36,
    season: 1,
    accessType: "subscription",
    collectionCategory: "Kult klassika",
    viewsCount: 6200,
    likesCount: 59,
    dislikesCount: 0,
    episodes: [
      { id: "gyebek-ep-1", episodeNumber: 1, title: "1-qism: Vatan himoyasi", duration: "1 soat 2 daqiqa", quality: "4K" },
      { id: "gyebek-ep-2", episodeNumber: 2, title: "2-qism: Sarkardaning qasamyodi", duration: "1 soat 2 daqiqa", quality: "4K" },
      { id: "gyebek-ep-3", episodeNumber: 3, title: "3-qism: Silla bilan to'qnashuv", duration: "1 soat 3 daqiqa", quality: "4K" },
      { id: "gyebek-ep-4", episodeNumber: 4, title: "4-qism: Hwangsanbeol jangi", duration: "1 soat 1 daqiqa", quality: "4K" },
    ],
    addedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "student-2",
    type: "series",
    title: "Student 2",
    originalTitle: "Student Season 2",
    year: 2026,
    rating: 9.4,
    duration: "21 daqiqa • 12 qism",
    ageRating: "6+",
    country: "O'zbekiston",
    language: "O'zbek tili",
    genres: ["Komediya", "Yoshlar", "Sarguzasht"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Student serialining ikkinchi fasli o'qishdan haydalgan qahramonlarning yana universitetga qayta chaqirilishi bilan boshlanadi. Ular uzoq tanaffusdan so'ng yana uchrashib, o'qish, ish va yashash uchun kvartira topish kabi turli qiyinchiliklarga duch keladilar.",
    director: "Javohir Obidjonov",
    cast: ["Zebo Raximova", "Javohir Obidjonov", "Umidjon Eshonqulov", "Suxrop Saidov", "Shodiyor Hamdamov", "Gambit"],
    castMembers: [
      { name: "Zebo Raximova", role: "Aktrisa", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces" },
      { name: "Javohir Obidjonov", role: "Aktyor / Rejissyor", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces" },
      { name: "Umidjon Eshonqulov", role: "Aktyor", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces" },
      { name: "Suxrop Saidov", role: "Aktyor", photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=faces" },
      { name: "Gambit", role: "Aktyor", photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=faces" },
    ],
    quality: "4K",
    featured: true,
    totalEpisodes: 12,
    season: 2,
    accessType: "subscription",
    collectionCategory: "Kayfiyat ko'taruvchi",
    viewsCount: 14500,
    likesCount: 120,
    dislikesCount: 2,
    episodes: [
      { id: "student2-ep-1", episodeNumber: 1, title: "1-qism: Universitetga qaytish", duration: "21 daqiqa", quality: "4K" },
      { id: "student2-ep-2", episodeNumber: 2, title: "2-qism: Kvartira qidiruvi", duration: "22 daqiqa", quality: "4K" },
      { id: "student2-ep-3", episodeNumber: 3, title: "3-qism: Yangi reja", duration: "20 daqiqa", quality: "4K" },
    ],
    addedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "mehmed-fotihlar-sultoni",
    type: "series",
    title: "Mehmed: Fotihlar Sultoni",
    year: 2025,
    rating: 9.3,
    duration: "4-fasl • 18 qism",
    ageRating: "16+",
    country: "Turkiya",
    language: "O'zbekcha (Dublyaj)",
    genres: ["Tarixiy", "Jangari", "Drama"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Konstantinopolni zabt etgan buyuk Usmonli sultoni Mehmed II ning hayoti va uning jahon tarixini o'zgartirgan harbiy yurishlari.",
    director: "Serdar Akar",
    cast: ["Serkan Çayoğlu", "Selim Bayraktar", "Fikret Kuşkan"],
    quality: "4K",
    featured: true,
    accessType: "subscription",
    collectionCategory: "Nafasni bo'g'adigan",
    viewsCount: 9800,
    episodes: [
      { id: "mehmed-ep-1", episodeNumber: 1, title: "1-qism: Taxt vorisi", duration: "1 soat 45 daqiqa", quality: "4K" },
      { id: "mehmed-ep-2", episodeNumber: 2, title: "2-qism: Fath rejasi", duration: "1 soat 40 daqiqa", quality: "4K" },
    ],
    addedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "sevganim-sensan",
    type: "series",
    title: "Sevganim Sensan",
    year: 2025,
    rating: 8.9,
    duration: "2-fasl • 24 qism",
    ageRating: "16+",
    country: "Turkiya",
    language: "O'zbekcha (Dublyaj)",
    genres: ["Melodrama", "Drama", "Romantika"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Ikkita turli dunyo vakillarining sevgi va sinovlarga to'la taqdiri haqidagi yurakni larzaga soluvchi turk seriali.",
    director: "Ali Bilgin",
    cast: ["Burak Özçivit", "Neslihan Atagül"],
    quality: "4K",
    featured: true,
    accessType: "subscription",
    collectionCategory: "Ko'z yosh dramalari",
    viewsCount: 12300,
    episodes: [
      { id: "sevganim-ep-1", episodeNumber: 1, title: "1-qism: Ilk uchrashuv", duration: "1 soat 15 daqiqa", quality: "4K" },
    ],
    addedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "naruto-shippuden",
    type: "anime",
    title: "Naruto Shippuden",
    year: 2025,
    rating: 9.8,
    duration: "24 daq • 500 qism",
    ageRating: "12+",
    country: "Yaponiya",
    language: "O'zbekcha (UzAnime)",
    genres: ["Anime", "Jangari", "Sarguzasht", "Fantastika"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Naruto Uzumaki Konoha qishlog'ini himoya qilish va Hokage bo'lish maqsadida buyuk mashg'ulotlarni o'tab, Akatsuki tashkilotiga qarshi kurashadi.",
    director: "Hayato Date",
    cast: ["Junko Takeuchi", "Noriaki Sugiyama"],
    quality: "4K",
    featured: true,
    accessType: "free",
    collectionCategory: "Tomoshabinlar tanlovi",
    viewsCount: 34000,
    episodes: [
      { id: "naruto-ep-1", episodeNumber: 1, title: "1-qism: Uyga qaytish", duration: "24 daqiqa", quality: "4K" },
      { id: "naruto-ep-2", episodeNumber: 2, title: "2-qism: Akatsuki harakati", duration: "24 daqiqa", quality: "4K" },
    ],
    addedAt: "2026-03-15T00:00:00.000Z",
  },
  {
    id: "solo-leveling",
    type: "anime",
    title: "Solo Leveling 2-mavsum",
    year: 2025,
    rating: 9.9,
    duration: "24 daq • 12 qism",
    ageRating: "16+",
    country: "Koreya / Yaponiya",
    language: "O'zbekcha (AnimeDub)",
    genres: ["Anime", "Fantastika", "Jangari"],
    poster: "/images/poster-1.png",
    backdrop: "/images/hero-1.png",
    synopsis: "Sung Jin-woo dunyoning eng kuchsiz ovchisidan yashirin tizim orqali cheksiz kuchga ega bo'lgan soya monarxiga aylanadi.",
    director: "Shunsuke Nakashige",
    cast: ["Taito Ban", "Genta Nakamura"],
    quality: "4K",
    featured: true,
    accessType: "subscription",
    collectionCategory: "Aqlni shoshiradigan",
    viewsCount: 45000,
    episodes: [
      { id: "solo-ep-1", episodeNumber: 1, title: "1-qism: Soya armiyasi", duration: "24 daqiqa", quality: "4K" },
    ],
    addedAt: "2026-03-20T00:00:00.000Z",
  },
]

// Global live store synced in memory
let globalMediaStore: MediaItem[] = [...initialSeedMedia]

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
