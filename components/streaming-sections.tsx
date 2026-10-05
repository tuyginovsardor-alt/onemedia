"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Play, Sparkles, Star } from 'lucide-react'
import type { MediaItem } from "@/lib/anime-store"
import { cn } from "@/lib/utils"

// 1. TOP-10 Component with 3D Red Neon Numerals (Screenshot photo_8)
export function TopTenSection({ items }: { items: MediaItem[] }) {
  const [period, setPeriod] = useState<"weekly" | "3days" | "daily">("weekly")
  const topList = items.slice(0, 10)

  return (
    <section className="py-4 space-y-3">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-[#ef4444]" />
          <h2 className="font-display text-lg font-black text-white uppercase tracking-wider">
            TOP-10
          </h2>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 rounded-full bg-white/5 p-1 border border-white/10 text-[11px] font-semibold">
          <button
            onClick={() => setPeriod("weekly")}
            className={cn(
              "rounded-full px-2.5 py-0.5 transition",
              period === "weekly" ? "bg-[#1e2333] text-white" : "text-white/50 hover:text-white"
            )}
          >
            Haftalik
          </button>
          <button
            onClick={() => setPeriod("3days")}
            className={cn(
              "rounded-full px-2.5 py-0.5 transition",
              period === "3days" ? "bg-[#1e2333] text-white" : "text-white/50 hover:text-white"
            )}
          >
            3 kunlik
          </button>
          <button
            onClick={() => setPeriod("daily")}
            className={cn(
              "rounded-full px-2.5 py-0.5 transition",
              period === "daily" ? "bg-[#1e2333] text-white" : "text-white/50 hover:text-white"
            )}
          >
            Kunlik
          </button>
        </div>
      </div>

      {/* Horizontal Scroll with 3D Number Overlay */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
        {topList.map((item, idx) => {
          const rank = idx + 1
          return (
            <Link
              key={item.id}
              href={`/film/${item.id}`}
              className="group relative flex-none snap-start flex items-end pt-4 pl-8"
              style={{ width: "160px" }}
            >
              {/* Huge 3D Red Numeral behind poster */}
              <span
                className="absolute left-0 bottom-2 text-7xl font-black italic select-none pointer-events-none tracking-tighter"
                style={{
                  color: "#ef4444",
                  textShadow: "0 0 20px rgba(239, 68, 68, 0.6), 2px 2px 0px #7f1d1d, 4px 4px 0px #450a0a",
                  fontFamily: "system-ui, sans-serif",
                  zIndex: 0,
                }}
              >
                {rank}
              </span>

              {/* Poster Card */}
              <div className="relative z-10 aspect-[2/3] w-32 overflow-hidden rounded-2xl bg-[#121522] border border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={item.poster || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {/* Age Rating Badge */}
                <div className="absolute top-2 left-2 z-10 rounded bg-black/60 backdrop-blur px-1.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
                  {item.ageRating || "16+"}
                </div>
                {/* Access badge */}
                {item.accessType === "subscription" ? (
                  <div className="absolute top-2 right-2 z-10 rounded bg-gradient-to-r from-amber-500 to-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow">
                    PREMIUM
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 z-10 rounded bg-emerald-500/90 backdrop-blur px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Bepul
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2">
                  <p className="font-bold text-xs text-white line-clamp-1 group-hover:text-[#ef4444] transition">
                    {item.title}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// 2. Curated Category Row (Screenshot photo_13 & photo_8)
export function CategoryRow({
  title,
  items,
  catalogHref = "/catalog",
  badgeType = "auto",
}: {
  title: string
  items: MediaItem[]
  catalogHref?: string
  badgeType?: "auto" | "bepul" | "premium" | "shorts"
}) {
  if (items.length === 0) return null

  return (
    <section className="py-3 space-y-2.5">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[#ef4444]" />
          <h2 className="font-display text-base font-bold text-white">
            {title}
          </h2>
        </div>
        <Link
          href={catalogHref}
          className="flex items-center gap-1 text-xs font-semibold text-white/50 hover:text-white transition"
        >
          Barchasini ko'rish
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
        {items.map((item) => {
          const isPremium = item.accessType === "subscription"
          return (
            <Link
              key={item.id}
              href={`/film/${item.id}`}
              className="group flex-none snap-start w-32 sm:w-36 space-y-1.5"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#121522] border border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={item.poster || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />

                {/* Badge (Bepul / Premium / Shorts / Age) */}
                {badgeType === "shorts" ? (
                  <div className="absolute top-2 left-2 z-10 rounded bg-[#ef4444] px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow">
                    Shorts
                  </div>
                ) : isPremium ? (
                  <div className="absolute top-2 right-2 z-10 rounded bg-gradient-to-r from-amber-400 to-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow">
                    PREMIUM
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 z-10 rounded bg-emerald-500/90 backdrop-blur px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Bepul
                  </div>
                )}

                <div className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur px-1 py-0.5 text-[9px] font-bold text-white/90">
                  {item.ageRating || "16+"}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-lg">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Info */}
              <div className="px-0.5">
                <p className="font-bold text-xs text-white line-clamp-1 group-hover:text-[#ef4444] transition">
                  {item.title}
                </p>
                <p className="text-[10px] text-white/50 line-clamp-1">
                  {item.genres.slice(0, 2).join(", ")}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// 3. AI Recommendation Banner (Screenshot photo_8)
export function RecommendationBanner() {
  return (
    <div className="mx-4 my-2 overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-r from-[#180d19] via-[#121524] to-[#0d1428] p-5 shadow-xl relative">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#ef4444]">
            SIZ UCHUN MOS TAVSIYALAR
          </p>
          <p className="text-xs text-white/70 max-w-xs leading-relaxed">
            Siz tomosha qiladigan kontent asosida eng sara yangi filmlar tanlanadi.
          </p>
          <div className="pt-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ef4444] px-4 py-2 text-xs font-bold text-white hover:bg-[#dc2626] transition shadow-lg shadow-red-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ishga tushirish
            </Link>
          </div>
        </div>

        <div className="relative hidden sm:block h-20 w-32 shrink-0">
          <Image
            src="/images/animation-banner.png"
            alt="Tavsiyalar"
            fill
            className="object-cover rounded-xl opacity-80"
          />
        </div>
      </div>
    </div>
  )
}
