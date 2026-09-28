import Image from "next/image"
import { Clapperboard, Bell, Play } from 'lucide-react'
import { movies } from "@/lib/movies"
import { HilltopAdBannerSecondary } from "@/components/hilltop-ad-banner"

export default function ShortsPage() {
  const previews = movies.slice(0, 4)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 md:px-8 md:pt-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/25 via-card to-card p-8 ring-1 ring-primary/30 md:p-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
            <Clapperboard className="h-3.5 w-3.5" />
            Tez kunda
          </span>
          <h1 className="mt-5 font-display text-4xl font-black text-white md:text-6xl text-balance">
            OneMedia <span className="text-gradient">Shorts</span>
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-white/70">
            Filmlarning eng qiziqarli lahzalari, treylerlar va qisqa kliplar — vertikal formatda,
            bir marta suring va yangi kashfiyot. Bu bo'lim ustida ishlayapmiz!
          </p>
          <button className="mt-7 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105">
            <Bell className="h-5 w-5" />
            Ishga tushganda xabar bering
          </button>
        </div>
      </div>

      {/* Vertical preview mockups */}
      <div className="mt-10 grid grid-cols-2 gap-4 pb-8 sm:grid-cols-4">
        {previews.map((m, i) => (
          <div
            key={m.id}
            className="group relative aspect-[9/16] overflow-hidden rounded-2xl ring-1 ring-white/10"
          >
            <Image src={m.poster || "/placeholder.svg"} alt={m.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-xs font-semibold text-white">{m.title}</p>
              <p className="text-[10px] text-white/60">{(i + 1) * 128}K ko'rildi</p>
            </div>
            <span className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              0:{30 + i * 5}
            </span>
          </div>
        ))}
      </div>

      <HilltopAdBannerSecondary />
    </div>
  )
}
