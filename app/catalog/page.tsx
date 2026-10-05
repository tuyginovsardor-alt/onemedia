"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Layers, Film, Sparkles, Star, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { MovieCard } from "@/components/movie-card"
import { movies as staticMovies, genres } from "@/lib/movies"
import { cn } from "@/lib/utils"

const collectionsData = [
  {
    id: "nafasni-bogadigan",
    title: "Nafasni bo'g'adigan",
    subtitle: "Triller, Jangari va Kuchli sarguzashtlar",
    posters: ["/images/poster-1.png", "/images/poster-3.png", "/images/poster-6.png"],
    genreFilter: "Jangari",
  },
  {
    id: "kult-klassika",
    title: "Kult klassika",
    subtitle: "Dunyo kinosining durdonalari",
    posters: ["/images/poster-1.png", "/images/poster-2.png", "/images/poster-3.png"],
    genreFilter: "Tarixiy",
  },
  {
    id: "aqlni-shoshiradigan",
    title: "Aqlni shoshiradigan",
    subtitle: "Syujeti kutilmagan burilishlarga boy",
    posters: ["/images/poster-6.png", "/images/poster-5.png", "/images/poster-1.png"],
    genreFilter: "Fantastika",
  },
  {
    id: "koz-yosh-dramalari",
    title: "Ko'z yosh dramalari",
    subtitle: "Eng ta'sirli va chuqur melodramalar",
    posters: ["/images/poster-4.png", "/images/poster-1.png", "/images/poster-2.png"],
    genreFilter: "Drama",
  },
  {
    id: "kayfiyat-kotaruvchi",
    title: "Kayfiyat ko'taruvchi",
    subtitle: "Kulgi va pozitiv his-tuyg'ular",
    posters: ["/images/poster-2.png", "/images/poster-5.png", "/images/poster-4.png"],
    genreFilter: "Komediya",
  },
  {
    id: "tomoshabinlar-tanlovi",
    title: "Tomoshabinlar tanlovi",
    subtitle: "Eng ko'p ko'rilgan va sevimlilar",
    posters: ["/images/poster-5.png", "/images/poster-6.png", "/images/poster-1.png"],
    genreFilter: "Anime",
  },
]

export default function CollectionsAndCatalogPage() {
  const [activeTab, setActiveTab] = useState<"toplam" | "janrlar">("toplam")
  const [selectedGenre, setSelectedGenre] = useState<string>("Barchasi")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [allMedia, setAllMedia] = useState<any[]>(staticMovies)

  useEffect(() => {
    fetch("/api/media")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.media) && data.media.length > 0) {
          const neonIds = new Set(data.media.map((m: any) => m.id))
          const filteredStatic = staticMovies.filter((m) => !neonIds.has(m.id))
          setAllMedia([...data.media, ...filteredStatic])
        }
      })
      .catch(() => null)
  }, [])

  const filteredMovies = useMemo(() => {
    if (selectedCollection) {
      const coll = collectionsData.find((c) => c.id === selectedCollection)
      if (coll) {
        return allMedia.filter((m) => m.genres?.includes(coll.genreFilter) || m.collectionCategory === coll.title)
      }
    }
    if (selectedGenre !== "Barchasi") {
      return allMedia.filter((m) => m.genres?.includes(selectedGenre))
    }
    return allMedia
  }, [allMedia, selectedGenre, selectedCollection])

  return (
    <div className="min-h-screen bg-[#070913] text-white px-4 pt-4 pb-28 max-w-7xl mx-auto space-y-6">
      {/* Top Segmented Controls: [To'plam | Janrlar] (Screenshot photo_14) */}
      <div className="flex items-center justify-center pt-2">
        <div className="flex w-full max-w-md items-center rounded-2xl bg-[#161a29] p-1.5 border border-white/10 shadow-lg">
          <button
            onClick={() => {
              setActiveTab("toplam")
              setSelectedCollection(null)
            }}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all",
              activeTab === "toplam"
                ? "bg-[#252b42] text-white shadow-md"
                : "text-white/60 hover:text-white"
            )}
          >
            To'plam
          </button>
          <button
            onClick={() => {
              setActiveTab("janrlar")
              setSelectedCollection(null)
            }}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all",
              activeTab === "janrlar"
                ? "bg-[#252b42] text-white shadow-md"
                : "text-white/60 hover:text-white"
            )}
          >
            Janrlar
          </button>
        </div>
      </div>

      {/* Selected Collection View Banner */}
      {selectedCollection && (
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-red-950/40 via-card to-card p-4 border border-red-500/30">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#ef4444]">Tanlangan to'plam:</p>
            <h2 className="text-lg font-black text-white">
              {collectionsData.find((c) => c.id === selectedCollection)?.title}
            </h2>
          </div>
          <button
            onClick={() => setSelectedCollection(null)}
            className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 transition"
          >
            Barchasini ko'rsatish ✕
          </button>
        </div>
      )}

      {/* TAB 1: TO'PLAM (Collage Stack Grid - Screenshot photo_14) */}
      {activeTab === "toplam" && !selectedCollection && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
          {collectionsData.map((col, idx) => (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col.id)}
              className="group cursor-pointer flex flex-col items-center space-y-3"
            >
              {/* Stacked Fan Posters Effect */}
              <div className="relative h-44 sm:h-52 w-full flex items-center justify-center pt-2">
                {/* Layer 1 (Left fan) */}
                <div className="absolute aspect-[2/3] w-24 sm:w-28 -rotate-12 translate-x-[-18px] opacity-70 rounded-xl overflow-hidden border border-white/20 shadow-md transition-transform duration-300 group-hover:-rotate-16 group-hover:scale-105">
                  <Image
                    src={col.posters[0]}
                    alt={col.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Layer 2 (Right fan) */}
                <div className="absolute aspect-[2/3] w-24 sm:w-28 rotate-12 translate-x-[18px] opacity-70 rounded-xl overflow-hidden border border-white/20 shadow-md transition-transform duration-300 group-hover:rotate-16 group-hover:scale-105">
                  <Image
                    src={col.posters[1]}
                    alt={col.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Layer 3 (Center Top Poster) */}
                <div className="relative z-10 aspect-[2/3] w-28 sm:w-32 rotate-1 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-0">
                  <Image
                    src={col.posters[2]}
                    alt={col.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>

              {/* Title Tag Pill (Screenshot photo_14) */}
              <div className="w-full text-center">
                <div className="inline-block w-full rounded-2xl bg-[#1e2338] px-3 py-2 border border-white/10 shadow group-hover:bg-[#ef4444] transition-colors">
                  <p className="font-bold text-xs sm:text-sm text-white tracking-tight line-clamp-1">
                    {col.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: JANRLAR (Genre Pills and Filter View) */}
      {activeTab === "janrlar" && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all",
                  selectedGenre === g
                    ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/30"
                    : "bg-[#161a29] text-white/60 border border-white/10 hover:text-white"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Movies Grid for Selected Category/Genre */}
      {(activeTab === "janrlar" || selectedCollection) && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Jami: <b>{filteredMovies.length} ta</b> film va serial</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
