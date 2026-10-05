"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Plus, Star, Info } from 'lucide-react'
import type { Movie } from "@/lib/movies"
import { cn } from "@/lib/utils"

export function Hero({ movies }: { movies: Movie[] }) {
  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    if (movies.length === 0) return
    setIndex((i) => (i + 1) % movies.length)
  }, [movies.length])

  useEffect(() => {
    if (movies.length === 0) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [next, movies.length])

  if (movies.length === 0) {
    return null
  }

  const current = movies[index]

  return (
    <section className="relative w-full overflow-hidden bg-[#070913] pt-1 pb-4">
      {/* Background Poster Slides with Ambient Glow */}
      <div className="relative h-[68vh] min-h-[480px] max-h-[660px] w-full overflow-hidden">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === index ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <Image
              src={
                movie.backdrop && !movie.backdrop.includes("hero-1.png")
                  ? movie.backdrop
                  : movie.poster || "/images/poster-1.png"
              }
              alt={movie.title}
              fill
              priority={i === 0}
              className="object-cover object-center"
            />
            {/* Top brand overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/60 via-transparent to-[#070913]" />
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#070913] via-[#070913]/90 to-transparent" />
          </div>
        ))}

        {/* Hero Content positioned at bottom */}
        <div className="absolute inset-x-0 bottom-3 z-20 flex flex-col items-center text-center px-4 max-w-xl mx-auto space-y-2.5">
          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white drop-shadow-md">
            {current.title}
          </h1>

          {/* Metadata line: Year · Genre · Age */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white/80">
            <span>{current.year}</span>
            <span className="text-white/40">•</span>
            <span>{current.genres.slice(0, 2).join(" • ")}</span>
            <span className="text-white/40">•</span>
            <span className="rounded border border-white/25 px-1.5 py-0.2 text-[10px] text-white/90">
              {current.ageRating}
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-xs text-white/70 line-clamp-2 max-w-md text-balance leading-relaxed">
            {current.synopsis}
          </p>

          {/* Carousel dots */}
          <div className="flex items-center gap-1.5 py-1">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slayd ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-[#ef4444]" : "w-1.5 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 w-full pt-1">
            <Link
              href={`/film/${current.id}`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#ef4444] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#ef4444]/30 hover:bg-[#dc2626] active:scale-95 transition"
            >
              <Play className="h-4 w-4 fill-current" />
              Tomosha qilish
            </Link>
            <button
              onClick={() => {
                alert(`«${current.title}» saqlandi!`)
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 active:scale-95 transition shrink-0"
              aria-label="Saqlash"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
