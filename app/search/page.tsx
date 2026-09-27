"use client"

import { useMemo, useState } from "react"
import { Search, Sparkles, TrendingUp } from 'lucide-react'
import { MovieCard } from "@/components/movie-card"
import { movies } from "@/lib/movies"
import { cn } from "@/lib/utils"

const suggestions = [
  "Kosmos haqidagi fantastik film",
  "Oila bilan ko'rish uchun multfilm",
  "Yuqori reytingli triller",
  "2025-yil yangi jangari kinolar",
]

export default function SearchPage() {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.synopsis.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        String(m.year).includes(q),
    )
  }, [query])

  const trending = movies.filter((m) => m.rating >= 8).slice(0, 6)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 md:px-8 md:pt-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/40">
          <Sparkles className="h-3.5 w-3.5" />
          AI bilan qidiruv
        </span>
        <h1 className="mt-4 font-display text-3xl font-black text-white md:text-5xl text-balance">
          Nima tomosha qilmoqchisiz?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Kayfiyatingiz, janr yoki aktyorni yozing — sizga mos filmni topamiz.
        </p>
      </div>

      {/* Search box */}
      <div className="mx-auto mt-8 max-w-2xl">
        <div className="flex items-center gap-3 rounded-2xl glass-strong p-2 pl-5 ring-1 ring-white/15 focus-within:ring-primary/60">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masalan: kosmik sarguzasht filmi..."
            className="w-full bg-transparent py-3 text-white placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <button className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
            Qidirish
          </button>
        </div>

        {!query && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s.split(" ")[0])}
                className="rounded-full glass px-4 py-2 text-xs text-white/70 ring-1 ring-white/10 transition-colors hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-12">
        {query && (
          <p className="mb-5 text-sm text-muted-foreground">
            <span className="font-semibold text-white">{results.length}</span> ta natija topildi
          </p>
        )}

        <div
          className={cn(
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
            !query && "opacity-0 hidden",
          )}
        >
          {results.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>

        {query && results.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Hech narsa topilmadi. Boshqa so'z bilan urinib ko'ring.
          </p>
        )}

        {!query && (
          <div className="space-y-5 pb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-white">Mashhur qidiruvlar</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {trending.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
