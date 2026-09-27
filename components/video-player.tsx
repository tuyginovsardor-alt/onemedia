"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, Maximize, Settings } from 'lucide-react'
import { cn } from "@/lib/utils"

export function VideoPlayer({ poster, title }: { poster: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
      <Image src={poster || "/placeholder.svg"} alt={`${title} — video`} fill className="object-cover" />
      <div className={cn("absolute inset-0 bg-black/40 transition-opacity", playing && "opacity-0")} />

      {/* Center play */}
      {!playing && (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="O'ynatish"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground glow-blue transition-transform hover:scale-110">
            <Play className="h-8 w-8 fill-current" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div className={cn("h-full rounded-full bg-primary transition-all", playing ? "w-1/3" : "w-0")} />
        </div>
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "To'xtatish" : "O'ynatish"}>
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>
          <Volume2 className="h-5 w-5" />
          <span className="text-xs font-medium">
            {playing ? "42:10" : "00:00"} <span className="text-white/50">/ 2:18:00</span>
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold">4K</span>
            <Settings className="h-5 w-5" />
            <Maximize className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
