import Link from "next/link"
import Image from "next/image"
import { Search, Send, Bell, Flame } from 'lucide-react'
import { Hero } from "@/components/hero"
import { TopTenSection, CategoryRow, RecommendationBanner } from "@/components/streaming-sections"
import { getAllMedia } from "@/lib/anime-store"
import { fetchAllMediaFromNeon } from "@/lib/db/media-db"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let allMedia = await fetchAllMediaFromNeon()
  if (allMedia.length === 0) {
    allMedia = getAllMedia()
  }

  const featured = allMedia.filter((m) => m.featured)
  const premieres = allMedia.filter((m) => m.year >= 2025)
  const series = allMedia.filter((m) => m.type === "series" || m.duration.toLowerCase().includes("qism"))
  const anime = allMedia.filter((m) => m.type === "anime" || m.genres.includes("Anime"))
  const turkish = allMedia.filter((m) => m.country === "Turkiya" || m.genres.includes("Melodrama"))
  const actionMovies = allMedia.filter((m) => m.genres.includes("Jangari") || m.genres.includes("Tarixiy"))

  return (
    <div className="min-h-screen bg-[#070913] text-white pb-24">
      {/* Top Mobile/Desktop Header (Screenshot photo_13) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#070913]/90 px-4 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ef4444] to-[#f43f5e] text-white font-black shadow-lg shadow-[#ef4444]/30">
            ▶
          </div>
          <span className="font-display text-xl font-black uppercase tracking-wider text-white">
            One<span className="text-[#ef4444]">Media</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Qidiruv"
          >
            <Search className="h-4 w-4" />
          </Link>
          <a
            href="https://t.me/OneMediaRasmiy"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/25 transition"
            aria-label="Telegram Kanal"
          >
            <Send className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <Hero movies={featured.length > 0 ? featured : allMedia.slice(0, 5)} />

      {/* AI Recommendation Banner (Screenshot photo_8) */}
      <RecommendationBanner />

      {/* TOP-10 Section with 3D Red Numerals (Screenshot photo_8) */}
      <TopTenSection items={allMedia} />

      {/* Category: Premyera */}
      <CategoryRow
        title="Premyera"
        items={premieres.length > 0 ? premieres : allMedia.slice(0, 8)}
        catalogHref="/catalog"
      />

      {/* Category: Horij seriallari (Screenshot photo_13) */}
      <CategoryRow
        title="Horij seriallari"
        items={series.length > 0 ? series : allMedia.slice(2, 8)}
        catalogHref="/catalog"
      />

      {/* Category: Turk seriallari */}
      <CategoryRow
        title="Turk seriallari"
        items={turkish.length > 0 ? turkish : series}
        catalogHref="/catalog"
      />

      {/* Category: Qisqa seriallar (Shorts) */}
      <CategoryRow
        title="Qisqa seriallar"
        items={allMedia.slice(0, 6)}
        catalogHref="/shorts"
        badgeType="shorts"
      />

      {/* Category: Anime & Multfilmlar */}
      <CategoryRow
        title="Anime & Multfilmlar"
        items={anime.length > 0 ? anime : allMedia.slice(1, 7)}
        catalogHref="/catalog"
      />

      {/* Category: Jangari & Tarixiy filmlar */}
      <CategoryRow
        title="Jangari & Tarixiy"
        items={actionMovies.length > 0 ? actionMovies : allMedia.slice(0, 6)}
        catalogHref="/catalog"
      />

      {/* Official Telegram Channel Banner */}
      <section className="px-4 py-4">
        <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-[#1b0d18] via-[#121524] to-[#0d1428] p-6 shadow-2xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ef4444]/15 px-3 py-1 text-xs font-bold text-[#ef4444] border border-[#ef4444]/30">
                📢 Rasmiy Kanalimiz
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-white">
                OneMedia Rasmiy Telegram Kanali
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-md">
                Eng yangi 4K premyeralar, seriallar va yangiliklar birinchi bo'lib rasmiy kanalimizda!
              </p>
            </div>
            <a
              href="https://t.me/OneMediaRasmiy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#ef4444] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/30 hover:bg-[#dc2626] transition active:scale-95 shrink-0"
            >
              <Send className="h-4 w-4" />
              Kanalga a'zo bo'lish
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
