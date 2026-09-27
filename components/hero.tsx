"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Plus, Star, Info } from 'lucide-react'
import type { Movie } from "@/lib/movies"
import { cn } from "@/lib/utils"

export function Hero({ movies }: { movies: Movie[] }) {
  const [index, setIndex] = useState(0)

  const next = useCallback(() => setIndex((i) => (i + 1) % movies.length), [movies.length])

  useEffect(() => {
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [next])

  return (
    <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden">
      {movies.map((movie, i) => (
        <div
          key={movie.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={movie.backdrop || "/placeholder.svg"}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-28 md:px-8 md:pb-20">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className={cn(
              "max-w-xl transition-all duration-700",
              i === index ? "translate-y-0 opacity-100" : "pointer-events-none absolute translate-y-4 opacity-0",
            )}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/40">
              #1 O'zbekistonda Trend
            </span>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight text-white md:text-6xl text-balance">
              {movie.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
              <span>{movie.year}</span>
              <span className="rounded border border-white/25 px-1.5 text-xs">{movie.ageRating}</span>
              <span>{movie.duration}</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold">{movie.quality}</span>
            </div>
            <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-white/70 md:text-base">
              {movie.synopsis}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/film/${movie.id}`}
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" />
                Tomosha qilish
              </Link>
              <Link
                href={`/film/${movie.id}`}
                className="flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
              >
                <Info className="h-5 w-5" />
                Batafsil
              </Link>
              <button
                className="flex h-12 w-12 items-center justify-center rounded-full glass text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
                aria-label="Ro'yxatga qo'shish"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-8 flex gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slayd ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-8 bg-primary" : "w-4 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
