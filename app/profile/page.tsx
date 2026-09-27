import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import {
  Crown,
  Send,
  ShieldCheck,
  CreditCard,
  Film,
  Sparkles,
  LogOut,
  User,
  Settings,
  Tv,
  CheckCircle2,
} from 'lucide-react'
import { getCurrentUser } from "@/lib/user-session"
import { getProfile } from "@/app/actions/profile"
import { ProfileEditor } from "@/components/profile-editor"
import { logoutUserAction } from "@/app/actions/profile-logout"
import { getAllMedia } from "@/lib/anime-store"
import { MovieCard } from "@/components/movie-card"

export default async function ProfilePage() {
  const reqHeaders = await headers()
  const user = await getCurrentUser(reqHeaders)
  if (!user) redirect("/sign-in")

  const savedProfile = await getProfile().catch(() => null)
  const profile = savedProfile ?? {
    bio: user.bio || "OneMedia kino portali a'zosi",
    phone: user.phone || "+998 90 123 45 67",
    location: user.location || "Toshkent, O'zbekiston",
    website: "https://t.me/onemediahd_bot",
  }

  const allMedia = getAllMedia()
  const watchLater = allMedia.slice(0, 4)

  return (
    <main className="min-h-screen text-white pb-32">
      {/* Banner */}
      <div className="relative h-44 w-full md:h-60 bg-gradient-to-r from-blue-950 via-slate-900 to-[#070913]">
        <Image
          src="/images/profile-banner.png"
          alt=""
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* User Card Header */}
        <div className="-mt-16 sm:-mt-20 flex flex-col gap-4 sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6">
          <div className="flex items-end gap-4">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-[#070913] shadow-2xl bg-slate-900 glow-blue">
              <Image
                src={user.image || "/images/avatar.png"}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-black text-white">{user.name}</h1>
                {user.role === "admin" && (
                  <span className="rounded bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 font-mono">
                {user.username || user.email}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Telegram ulandi
                </span>
                {user.telegramId && (
                  <span className="text-[10px] text-white/40">ID: {user.telegramId}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-400/20">
              <Crown className="h-4 w-4 fill-current" />
              4K Ultra VIP
            </span>

            {user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            )}

            <form action={logoutUserAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                Chiqish
              </button>
            </form>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* Left Details Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4 backdrop-blur">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Hisob & Telegram ma&apos;lumotlari
              </h2>

              <div className="space-y-2.5 text-xs text-white/80">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Status:</span>
                  <span className="font-semibold text-emerald-400">Faol obunachi</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Telegram:</span>
                  <span className="font-mono text-cyan-300">{user.username || "Bog'langan"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Sifat:</span>
                  <span className="font-semibold text-white">4K Ultra HD + HDR</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Qurilmalar:</span>
                  <span className="text-white">Cheksiz (Telefon, TV, PC)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-white/40">Bot xizmati:</span>
                  <span className="text-white font-medium">@onemediahd_bot</span>
                </div>
              </div>

              <Link
                href="/payment"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
              >
                <CreditCard className="h-4 w-4" />
                Obunani boshqarish / To&apos;lov
              </Link>
            </div>

            {/* Quick Bot Actions */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Send className="h-4 w-4 text-cyan-400" /> Telegram Bot imkoniyatlari
              </h3>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Botingiz orqali yangi kinolarni qidiring, kanallarga ulashing yoki 4K oqimni to&apos;g&apos;ridan-to&apos;g&apos;ri tomosha qiling.
              </p>
              <a
                href="https://t.me/onemediahd_bot"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition border border-white/10"
              >
                <Send className="h-3.5 w-3.5 text-cyan-400" /> Botga o&apos;tish
              </a>
            </div>
          </div>

          {/* Right Editor & Watchlist */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" /> Shaxsiy ma&apos;lumotlarni tahrirlash
              </h2>
              <ProfileEditor initial={profile} />
            </div>

            {/* Watchlist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="h-4 w-4 text-cyan-400" /> Sevimli & Oxirgi tomoshalar
                </h2>
                <Link href="/catalog" className="text-xs text-cyan-400 hover:underline">
                  Barchasini ko&apos;rish →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {watchLater.map((m) => (
                  <MovieCard key={m.id} movie={m as any} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
