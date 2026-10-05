"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Play,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Bookmark,
  Share2,
  Download,
  Send,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Crown,
} from 'lucide-react'
import type { MediaItem, Episode, CastMember } from "@/lib/anime-store"
import { VideoPlayer } from "@/components/video-player"
import { MovieCard } from "@/components/movie-card"
import { cn } from "@/lib/utils"

export function FilmDetailsView({
  movie,
  similarMovies,
}: {
  movie: MediaItem
  similarMovies: MediaItem[]
}) {
  const [selectedSeason, setSelectedSeason] = useState(movie.season || 1)
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)
  const [likes, setLikes] = useState(movie.likesCount || 59)
  const [dislikes, setDislikes] = useState(movie.dislikesCount || 0)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeEpisode, setActiveEpisode] = useState(1)

  const handleLike = () => {
    if (liked) {
      setLikes((l) => l - 1)
      setLiked(false)
    } else {
      setLikes((l) => l + 1)
      setLiked(true)
      if (disliked) {
        setDislikes((d) => d - 1)
        setDisliked(false)
      }
    }
  }

  const handleDislike = () => {
    if (disliked) {
      setDislikes((d) => d - 1)
      setDisliked(false)
    } else {
      setDislikes((d) => d + 1)
      setDisliked(true)
      if (liked) {
        setLikes((l) => l - 1)
        setLiked(false)
      }
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `OneMedia platformasida «${movie.title}» filmini 4K sifatda tomosha qiling!`,
        url: window.location.href,
      }).catch(() => null)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Havola nusxalandi!")
    }
  }

  const posterImg = movie.poster || (movie.posterFileId ? `/api/telegram/file-proxy?fileId=${movie.posterFileId}` : "/images/poster-1.png")
  const backdropImg = movie.backdrop && !movie.backdrop.includes("hero-1.png") ? movie.backdrop : posterImg

  const seasonsList = Array.from({ length: Math.max(movie.season || 1, 1) }, (_, i) => i + 1)

  // Cast members fallback if not defined
  const castList: CastMember[] = movie.castMembers && movie.castMembers.length > 0
    ? movie.castMembers
    : movie.cast.map((actorName, idx) => ({
        name: actorName,
        role: idx === 0 ? "Bosh aktyor" : idx === 1 ? "Bosh aktrisa" : "Aktyor",
        photo: `https://images.unsplash.com/photo-${1500000000000 + (idx * 54321) % 1000000000}?w=150&h=150&fit=crop&crop=faces`,
      }))

  return (
    <div className="min-h-screen bg-[#070913] text-white pb-32">
      {/* Top Hero Backdrop & Visual Header (Screenshot photo_11 & photo_1) */}
      <div className="relative w-full overflow-hidden">
        {/* Full-bleed Backdrop Image */}
        <div className="relative h-[65vh] min-h-[460px] max-h-[640px] w-full">
          <Image
            src={backdropImg}
            alt={movie.title}
            fill
            priority
            className="object-cover object-top"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/60 via-transparent to-[#070913]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070913] via-[#070913]/90 to-transparent" />
        </div>

        {/* Top Floating Actions: Back, Share, Heart */}
        <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between max-w-7xl mx-auto">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 transition"
          >
            ←
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved(!saved)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 transition",
                saved ? "text-[#ef4444] border-[#ef4444]" : "text-white"
              )}
            >
              <Bookmark className="h-5 w-5 fill-current" />
            </button>
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 transition"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Box Overlaid at bottom of Hero */}
        <div className="relative -mt-24 z-20 px-4 max-w-3xl mx-auto space-y-3">
          {/* Main Title Typography */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Subline 1: Country, Seasons, Age rating */}
          <div className="text-xs sm:text-sm text-white/70 font-medium">
            <span>{movie.country || "AQSH"}</span>
            {movie.season && <span>, {movie.season}-mavsum</span>}
            <span>, {movie.ageRating}</span>
          </div>

          {/* Badges / Genres Pills Row (Screenshot photo_11) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-xl bg-white/10 px-3 py-1 text-white border border-white/15">
              {movie.year}
            </span>
            {movie.genres.map((g) => (
              <span
                key={g}
                className="rounded-xl bg-white/10 px-3 py-1 text-white border border-white/15"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Availability Status in Emerald Green */}
          <p className="text-xs font-bold text-emerald-400">
            {movie.accessType === "subscription" ? "Obuna orqali ko'rish mumkin" : "Bepul tomosha qilish"}
          </p>

          {/* Big CTA Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="#player-section"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#ef4444] py-3.5 px-6 text-sm font-black text-white shadow-xl shadow-red-500/30 hover:bg-[#dc2626] active:scale-95 transition"
            >
              <Play className="h-5 w-5 fill-current" />
              Tomosha qilish
            </a>

            <button
              onClick={() => {
                alert(`«${movie.title}» Telegram bot orqali yuklab olish uchun so'rov yuborildi.`)
                window.open(`https://t.me/OneMediaRasmiy?start=dl_${movie.id}`, "_blank")
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition active:scale-95 shrink-0"
              title="Yuklab olish"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>

          {/* Social Stats Bar: Likes / Dislikes / Views (Screenshot photo_11) */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleLike}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#161928] py-2.5 px-3 border border-white/10 text-xs font-bold transition",
                liked ? "text-[#ef4444] border-red-500/40 bg-red-500/10" : "text-white/80 hover:text-white"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likes}</span>
            </button>

            <button
              onClick={handleDislike}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#161928] py-2.5 px-3 border border-white/10 text-xs font-bold transition",
                disliked ? "text-amber-400 border-amber-500/40 bg-amber-500/10" : "text-white/80 hover:text-white"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{dislikes}</span>
            </button>

            <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#161928] py-2.5 px-3 border border-white/10 text-xs font-bold text-white/80">
              <Eye className="h-4 w-4 text-white/50" />
              <span>{((movie.viewsCount || 5200) / 1000).toFixed(1)}k</span>
            </div>
          </div>

          {/* Rating Badges & Summary Box (Screenshot photo_11) */}
          <div className="rounded-2xl bg-[#121524] p-4 border border-white/10 space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-black text-amber-400 text-sm">
                <Star className="h-4 w-4 fill-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                IMDb 7.5
              </span>
              <span className="text-xs text-white/50">• {movie.dubbingStudio || "Uzbek Dublyaj"}</span>
            </div>

            <p className={cn(
              "text-xs text-white/70 leading-relaxed",
              !synopsisExpanded && "line-clamp-2"
            )}>
              {movie.synopsis}
            </p>

            <button
              onClick={() => setSynopsisExpanded(!synopsisExpanded)}
              className="text-xs font-bold text-white hover:text-[#ef4444] transition flex items-center gap-1"
            >
              {synopsisExpanded ? "Kamroq ko'rsatish" : "Batafsil"}
              {synopsisExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Technical Specs List (Screenshot photo_1 & photo_2) */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-[#121524]/60 p-3 rounded-2xl border border-white/5">
            <div>
              <span className="text-white/40">Tillar:</span>{" "}
              <span className="text-white font-medium">{movie.language || "O'zbekcha"}</span>
            </div>
            <div>
              <span className="text-white/40">Sifat:</span>{" "}
              <span className="text-[#ef4444] font-bold">{movie.quality || "4K Ultra HD"}</span>
            </div>
            <div>
              <span className="text-white/40">Davomiyligi:</span>{" "}
              <span className="text-white font-medium">{movie.duration}</span>
            </div>
            <div>
              <span className="text-white/40">Rejissyor:</span>{" "}
              <span className="text-white font-medium">{movie.director}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-4 max-w-4xl mx-auto space-y-8 pt-8">
        {/* VIDEO PLAYER SECTION */}
        <section id="player-section" className="scroll-mt-20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#ef4444]" />
              <h2 className="font-display text-lg font-black text-white">
                Onlayn Tomosha Qilish
              </h2>
            </div>
            <span className="text-xs font-semibold text-white/60">
              {movie.episodes[activeEpisode - 1]?.title || `${activeEpisode}-qism`}
            </span>
          </div>

          <VideoPlayer
            poster={backdropImg}
            title={movie.title}
            mediaId={movie.id}
            episodes={movie.episodes}
          />
        </section>

        {/* EPISODES SECTION: "Barcha qismlar" (Screenshot photo_12) */}
        {movie.episodes && movie.episodes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#ef4444]" />
                <h2 className="font-display text-lg font-black text-white">
                  Barcha qismlar
                </h2>
              </div>
              <span className="text-xs text-white/50">{movie.episodes.length} ta qism</span>
            </div>

            {/* Season Switcher Tabs */}
            {seasonsList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {seasonsList.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-bold transition",
                      selectedSeason === s
                        ? "bg-white text-black shadow-lg"
                        : "bg-[#161a29] text-white/60 border border-white/10 hover:text-white"
                    )}
                  >
                    {s}-mavsum
                  </button>
                ))}
              </div>
            )}

            {/* Episode Cards Grid / List (Screenshot photo_12) */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {movie.episodes.map((ep, idx) => (
                <div
                  key={ep.id || idx}
                  onClick={() => {
                    setActiveEpisode(ep.episodeNumber)
                    const playerElem = document.getElementById("player-section")
                    if (playerElem) playerElem.scrollIntoView({ behavior: "smooth" })
                  }}
                  className={cn(
                    "group cursor-pointer rounded-2xl bg-[#121524] p-2.5 border transition-all space-y-2",
                    activeEpisode === ep.episodeNumber
                      ? "border-[#ef4444] bg-red-950/20 shadow-lg shadow-red-500/10"
                      : "border-white/10 hover:border-white/20 hover:bg-[#161a29]"
                  )}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/60">
                    <Image
                      src={backdropImg}
                      alt={ep.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/30 text-white group-hover:bg-[#ef4444] group-hover:border-[#ef4444] transition">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-xs text-white line-clamp-1 group-hover:text-[#ef4444] transition">
                      {ep.title || `${ep.episodeNumber}-qism`}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {ep.duration || "1 soat 2 daqiqa"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CAST & CREW SECTION: "Aktyorlar va ijodkorlar" (Screenshot photo_12 & photo_1) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-[#ef4444]" />
            <h2 className="font-display text-lg font-black text-white">
              Aktyorlar va ijodkorlar
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {castList.map((member, idx) => (
              <div
                key={idx}
                className="flex-none flex flex-col items-center text-center space-y-2 w-24 sm:w-28"
              >
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-white/20 shadow-md">
                  <Image
                    src={member.photo || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces`}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs text-white line-clamp-1">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-white/50 line-clamp-1">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SIMILAR MOVIES SLIDER (Screenshot photo_12) */}
        {similarMovies.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#ef4444]" />
              <h2 className="font-display text-lg font-black text-white">
                O'xshash filmlar
              </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {similarMovies.map((sim) => (
                <div key={sim.id} className="flex-none w-32 sm:w-36">
                  <MovieCard movie={sim as any} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
