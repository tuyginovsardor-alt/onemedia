"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal } from 'lucide-react'
import { MovieCard } from "@/components/movie-card"
import { movies, genres } from "@/lib/movies"
import { cn } from "@/lib/utils"
import { HilltopAdBanner } from "@/components/hilltop-ad-banner"

type Sort = "reyting" | "yil" | "nom"

export default function CatalogPage() {
  const [genre, setGenre] = useState("Barchasi")
  const [sort, setSort] = useState<Sort>("reyting")

  const list = useMemo(() => {
    const filtered =
      genre === "Barchasi" ? movies : movies.filter((m) => m.genres.includes(genre))
    return [...filtered].sort((a, b) => {
      if (sort === "reyting") return b.rating - a.rating
      if (sort === "yil") return b.year - a.year
      return a.title.localeCompare(b.title)
    })
  }, [genre, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black text-white md:text-4xl">Katalog</h1>
        <p className="text-sm text-muted-foreground">
          {list.length} ta film va serial • janr bo'yicha saralang
        </p>
      </div>

      {/* Genres */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
              genre === g
                ? "bg-primary text-primary-foreground glow-blue"
                : "glass text-muted-foreground ring-1 ring-white/10 hover:text-white",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="mt-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Saralash:</span>
        {(
          [
            { key: "reyting", label: "Reyting" },
            { key: "yil", label: "Yil" },
            { key: "nom", label: "Nomi" },
          ] as { key: Sort; label: string }[]
        ).map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              sort === s.key ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Ad Banner */}
      <HilltopAdBanner />

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 pb-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {list.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="my-16 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center space-y-3">
          <p className="text-base font-semibold text-white/80">Katalogda filmlar topilmadi</p>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Neon bazasiga yangi kinolar yoki animelar yuklangach, barchasi shu yerda avtomatik ko&apos;rinadi.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"
            >
              Bosh sahifaga qaytish
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
