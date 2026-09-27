import Link from "next/link"
import Image from "next/image"
import { Star, Play } from 'lucide-react'
import type { Movie } from "@/lib/movies"
import { cn } from "@/lib/utils"

export function MovieCard({ movie, className }: { movie: Movie; className?: string }) {
  return (
    <Link
      href={`/film/${movie.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-300 hover:ring-primary/60 hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={movie.poster || "/placeholder.svg"}
          alt={`${movie.title} afishasi`}
          fill
          sizes="(max-width: 768px) 40vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
          {movie.quality}
        </span>
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-white/15 backdrop-blur">
          <Star className="h-3 w-3 fill-amber-400" />
          {movie.rating.toFixed(1)}
        </span>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground glow-blue">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="truncate text-sm font-semibold text-white">{movie.title}</h3>
          <p className="truncate text-xs text-white/60">
            {movie.year} • {movie.genres[0]}
          </p>
        </div>
      </div>
    </Link>
  )
}
