"use client"

import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, Crown, Send, LogOut, CheckCircle2, Sparkles, KeyRound } from 'lucide-react'
import type { AdminProfileInfo } from "@/lib/admin-auth"
import { logoutAdminAction } from "@/app/actions/admin-auth-actions"

export function AdminProfileBanner({
  admin,
  currentView = "web",
}: {
  admin: AdminProfileInfo
  currentView?: "web" | "tg"
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/30 p-4 sm:p-5 backdrop-blur shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-400/20 bg-slate-900">
            <Image
              src={admin.avatar || "/images/avatar.png"}
              alt={admin.name}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-base sm:text-lg font-black text-white tracking-tight">
                {admin.name}
              </h2>
              {admin.isSuperAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-400/40 shadow-sm">
                  <Crown className="h-3 w-3 fill-current" /> SUPER ADMIN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-white/70 font-mono flex-wrap">
              {admin.username && <span className="text-cyan-300 font-semibold">{admin.username}</span>}
              {admin.telegramId && (
                <span className="text-white/40 bg-white/5 px-1.5 py-0.2 rounded text-[10px]">
                  ID: {admin.telegramId}
                </span>
              )}
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-sans">
                <CheckCircle2 className="h-3 w-3" /> SHA-256 Faol
              </span>
            </div>

            <p className="text-[11px] text-white/50 hidden sm:block">
              To&apos;liq boshqaruv huquqiga ega. Barcha o&apos;zgarishlar darhol sayt va botga ta&apos;sir qiladi.
            </p>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {currentView === "web" ? (
            <Link
              href="/admin/tg"
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 transition flex items-center gap-1.5"
            >
              📱 TG App
            </Link>
          ) : (
            <Link
              href="/admin"
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 transition flex items-center gap-1.5"
            >
              💻 Web Studio
            </Link>
          )}

          <a
            href="https://t.me/onemediahd_bot"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5 text-cyan-400" /> Bot
          </a>

          <form action={async () => {
            await logoutAdminAction(currentView === "tg" ? "/admin/tg" : "/admin")
          }}>
            <button
              type="submit"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
