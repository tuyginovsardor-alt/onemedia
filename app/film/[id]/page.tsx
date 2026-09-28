import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, Plus, Share2, Download, Send } from 'lucide-react'
import { VideoPlayer } from "@/components/video-player"
import { MovieCard } from "@/components/movie-card"
import { getMovie, movies } from "@/lib/movies"
import { getMediaById, getAllMedia } from "@/lib/anime-store"
import { HilltopAdBanner, HilltopAdBannerSecondary } from "@/components/hilltop-ad-banner"

export const dynamic = "force-dynamic"

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movie = getMediaById(id) || getMovie(id)
  if (!movie) notFound()

  const similar = movies
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .slice(0, 6)

  return (
    <div className="relative">
      {/* Backdrop */}
      <div className="absolute inset-x-0 top-0 h-[45vh] md:h-[60vh] pointer-events-none">
        <Image src={movie.backdrop || "/placeholder.svg"} alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/50 via-[#070913]/85 to-[#070913]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-4 md:px-8 md:pt-12 pb-36">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[280px_1fr]">
          {/* Poster */}
          <div className="mx-auto w-44 sm:w-56 shrink-0 lg:mx-0 lg:w-full">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-2xl glow-blue">
              <Image src={movie.poster || "/placeholder.svg"} alt={`${movie.title} afishasi`} fill className="object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {movie.genres.map((g) => (
                <span key={g} className="rounded-full bg-white/10 px-3 py-1 text-[11px] sm:text-xs font-medium text-white ring-1 ring-white/15">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white text-balance">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
              <span>{movie.year}</span>
              <span className="rounded border border-white/25 px-1.5 text-[11px]">{movie.ageRating}</span>
              <span>{movie.duration}</span>
              <span className="rounded-md bg-cyan-400/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
                {movie.quality}
              </span>
            </div>

            <p className="max-w-2xl text-xs sm:text-sm text-pretty leading-relaxed text-white/75">{movie.synopsis}</p>

            <div className="grid gap-1 text-xs sm:text-sm text-white/70">
              <p>
                <span className="text-white/40">Rejissyor:</span>{" "}
                <span className="text-white font-medium">{movie.director}</span>
              </p>
              <p>
                <span className="text-white/40">Rollarda:</span>{" "}
                <span className="text-white font-medium">{movie.cast.join(", ")}</span>
              </p>
            </div>

            {/* Action Buttons: Responsive 4-col on mobile, flex on desktop */}
            <div className="grid grid-cols-4 gap-2 pt-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <a
                href="#player"
                className="col-span-4 sm:col-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/20 active:scale-95 transition hover:bg-cyan-300"
              >
                <Star className="h-4 w-4 fill-current" />
                Hoziroq tomosha qilish
              </a>
              <button className="col-span-2 sm:col-auto flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition">
                <Plus className="h-4 w-4" /> Ro&apos;yxatga
              </button>
              <button className="col-span-1 sm:col-auto flex h-10 w-full sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95 transition" aria-label="Yuklab olish">
                <Download className="h-4 w-4" />
              </button>
              <button className="col-span-1 sm:col-auto flex h-10 w-full sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95 transition" aria-label="Ulashish">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Player */}
        <div id="player" className="mt-12 scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">Onlayn ko&apos;rish</h2>
          <VideoPlayer
            poster={movie.backdrop}
            title={movie.title}
            mediaId={movie.id}
            episodes={(movie as any).episodes}
          />
          <HilltopAdBanner />
          <div className="flex flex-col items-start gap-3 rounded-2xl glass p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">
              To'liq versiyani Telegram bot orqali ham ko'rishingiz mumkin.
            </p>
            <a
              href="https://t.me/OneMediaHdBot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" /> Botda ochish
            </a>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-14 space-y-5 pb-8">
            <HilltopAdBannerSecondary />
            <h2 className="font-display text-2xl font-bold text-white">O'xshash filmlar</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}

        <div className="pb-8 pt-4">
          <Link href="/catalog" className="text-sm text-primary hover:text-accent">
            ← Katalogga qaytish
          </Link>
        </div>
      </div>
    </div>
  )
}
