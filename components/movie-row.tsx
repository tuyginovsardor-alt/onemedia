import Link from "next/link"
import { ChevronRight } from 'lucide-react'
import type { Movie } from "@/lib/movies"
import { MovieCard } from "@/components/movie-card"

export function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-4 md:px-8">
        <h2 className="font-display text-xl font-bold text-white md:text-2xl">{title}</h2>
        <Link
          href="/catalog"
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-accent"
        >
          Barchasi
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 md:px-8">
        {movies.map((movie) => (
          <MovieCard key={movie.id + title} movie={movie} className="w-[150px] shrink-0 md:w-[190px]" />
        ))}
      </div>
    </section>
  )
}
