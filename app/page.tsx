import Link from "next/link"
import Image from "next/image"
import { Send, ShieldCheck, Zap, Clapperboard } from 'lucide-react'
import { Hero } from "@/components/hero"
import { MovieRow } from "@/components/movie-row"
import { MovieCard } from "@/components/movie-card"
import { getFeatured, rows, getMovie, movies } from "@/lib/movies"

export default function HomePage() {
  const featured = getFeatured()

  return (
    <div className="space-y-14">
      <Hero movies={featured} />

      {/* Feature strip */}
      <section className="mx-auto -mt-24 max-w-7xl px-4 md:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <FeatureChip
            icon={ShieldCheck}
            title="100% Rasmiy"
            desc="Litsenziyalangan kontent"
          />
          <FeatureChip icon={Zap} title="4K Ultra HD" desc="Yuqori sifatli oqim" />
          <FeatureChip icon={Clapperboard} title="10 000+ film" desc="Har kuni yangilanadi" />
        </div>
      </section>

      {rows.map((row) => (
        <MovieRow
          key={row.title}
          title={row.title}
          movies={row.ids.map((id) => getMovie(id)!).filter(Boolean)}
        />
      ))}

      {/* Animation banner */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10">
          <Image
            src="/images/animation-banner.png"
            alt="Multfilmlar to'plami"
            width={1600}
            height={600}
            className="h-64 w-full object-cover md:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-4 p-8 md:p-12">
            <h2 className="max-w-md font-display text-3xl font-black text-white md:text-4xl text-balance">
              Butun oila uchun multfilmlar
            </h2>
            <p className="max-w-sm text-sm text-white/70">
              Bolalaringiz uchun eng sara animatsion filmlar — xavfsiz va reklama-siz.
            </p>
            <Link
              href="/catalog"
              className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              To'plamni ko'rish
            </Link>
          </div>
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/25 via-card to-card p-8 ring-1 ring-primary/30 md:p-12">
          <div className="relative z-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h2 className="font-display text-3xl font-black text-white text-balance">
                Telegram bot bilan yanada qulay
              </h2>
              <p className="max-w-lg text-sm text-white/70">
                @OneMediaHdBot orqali filmlarni qidiring, yangiliklardan xabardor bo'ling va to'g'ridan-to'g'ri
                tomosha qiling.
              </p>
            </div>
            <a
              href="https://t.me/OneMediaHdBot"
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              <Send className="h-5 w-5" />
              Botni ochish
            </a>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
        </div>
      </section>

      {/* Recently added grid */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 pb-4 md:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Yaqinda qo&apos;shilgan</h2>
          <Link href="/catalog" className="text-xs font-semibold text-cyan-400 hover:underline">
            Barchasini ko&apos;rish →
          </Link>
        </div>
        {movies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-white/70">
              Kinolar va animelar tez orada yuklanadi.
            </p>
            <p className="text-xs text-white/40">
              Eng so&apos;nggi premyeralarni tomosha qilish uchun bizning Telegram kanal va botimizga ulaning!
            </p>
            <a
              href="https://t.me/OneMediaHdBot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"
            >
              🤖 Telegram Botga o&apos;tish
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.slice(0, 12).map((movie) => (
              <MovieCardWrapper key={movie.id} id={movie.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FeatureChip({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl glass p-4 ring-1 ring-white/10">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function MovieCardWrapper({ id }: { id: string }) {
  const movie = getMovie(id)
  if (!movie) return null
  return <MovieCard movie={movie} />
}
