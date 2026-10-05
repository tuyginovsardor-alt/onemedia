import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import {
  Crown,
  CreditCard,
  QrCode,
  Smartphone,
  Gift,
  History,
  Headphones,
  Share2,
  Globe,
  LogOut,
  ChevronRight,
  Send,
  Camera,
  Plus,
  Tv,
} from 'lucide-react'
import { getCurrentUser } from "@/lib/user-session"
import { logoutUserAction } from "@/app/actions/profile-logout"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const reqHeaders = await headers()
  const user = await getCurrentUser(reqHeaders)

  const displayName = user?.name || "Firdavs"
  const userIdentifier = user?.phone || user?.username || "+998 93 083 77 86"
  const userId = user?.telegramId || "251202"
  const firstLetter = displayName.charAt(0).toUpperCase() || "F"

  return (
    <div className="min-h-screen bg-[#070913] text-white px-4 pt-6 pb-28 max-w-lg mx-auto space-y-4">
      {/* Top Header Card (Screenshot photo_9) */}
      <div className="flex items-center gap-3.5 rounded-3xl bg-[#161a29] p-4 border border-white/10 shadow-lg">
        {/* Avatar with initial or image */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#252b42] text-xl font-black text-white border border-white/20">
          {firstLetter}
        </div>

        <div className="space-y-0.5 flex-1">
          <h1 className="font-display text-lg font-black text-white">{displayName}</h1>
          <p className="text-xs text-white/60">{userIdentifier}</p>
          <p className="text-[11px] font-mono text-white/40">ID: {userId}</p>
        </div>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-xl bg-[#ef4444] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/20"
          >
            Admin
          </Link>
        )}
      </div>

      {/* 2 Stat Cards: Balans & Obuna (Screenshot photo_9) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Balans */}
        <div className="rounded-3xl bg-[#161a29] p-4 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-white/60">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-medium">Balans</span>
          </div>
          <p className="font-display text-base font-black text-white">0 so&apos;m</p>
          <Link
            href="/payment"
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-white/10 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            <Plus className="h-3.5 w-3.5" /> To&apos;ldirish
          </Link>
        </div>

        {/* Card 2: Obuna */}
        <div className="rounded-3xl bg-[#161a29] p-4 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-white/60">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium">Obuna</span>
          </div>
          <p className="font-display text-sm font-bold text-[#ef4444]">Mavjud emas</p>
          <Link
            href="/payment"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#ef4444] py-1.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-[#dc2626] transition"
          >
            Ulanish
          </Link>
        </div>
      </div>

      {/* Menu List (Screenshot photo_9) */}
      <div className="rounded-3xl bg-[#161a29] border border-white/10 divide-y divide-white/5 overflow-hidden">
        <Link
          href="/payment"
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-sm">💰</span>
            <span className="text-xs font-bold text-white">Obunalar</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </Link>

        <Link
          href="/tv"
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <QrCode className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">OneMedia TV ni aktivlashtirish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </Link>

        <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition cursor-pointer">
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-white">Mening qurilmalarim</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>

        <Link
          href="/payment"
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Balansni to&apos;ldirish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </Link>

        <div
          onClick={() => alert("Promokod kiritish oynasi tez orada faollashadi!")}
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Gift className="h-4 w-4 text-pink-400" />
            <span className="text-xs font-bold text-white">Promokodlarni faollashtirish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>

        <Link
          href="/payment"
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <History className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-white">To&apos;lov va xaridlar tarixi</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </Link>

        <a
          href="https://t.me/OneMediaRasmiy"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <Headphones className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-bold text-white">Qo&apos;llab-quvvatlash</span>
          </div>
          <span className="text-xs text-white/50">@OneMediaRasmiy &gt;</span>
        </a>

        <div
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "OneMedia", url: window.location.origin }).catch(() => null)
            } else {
              navigator.clipboard.writeText(window.location.origin)
              alert("Havola nusxalandi!")
            }
          }}
          className="flex items-center justify-between p-3.5 hover:bg-white/5 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">Ulashish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>
      </div>

      {/* Language Box (Screenshot photo_9) */}
      <div className="flex items-center justify-between rounded-3xl bg-[#161a29] p-3.5 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-base">🇺🇿</span>
          <span className="text-xs font-bold text-white">Ilova tili</span>
        </div>
        <span className="text-xs text-white/60 flex items-center gap-1">
          O&apos;zbekcha <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Log out button */}
      <form action={async () => {
        'use server'
        await logoutUserAction()
      }}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-3xl bg-[#161a29] p-3.5 border border-white/10 text-[#ef4444] hover:bg-red-500/10 transition"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs font-bold">Akkauntdan chiqish</span>
        </button>
      </form>

      {/* Social Icons (Screenshot photo_9) */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#161a29] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          <Camera className="h-5 w-5" />
        </a>
        <a
          href="https://t.me/OneMediaRasmiy"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#161a29] border border-white/10 text-[#ef4444] hover:text-white hover:bg-red-500/20 transition"
        >
          <Send className="h-5 w-5" />
        </a>
      </div>

      {/* Version and Diagnostics Footer */}
      <div className="text-center space-y-1 pt-1">
        <p className="text-[11px] text-white/40">Ilova versiya: 2.4.0 (Yangi Dizayn)</p>
        <p className="text-[10px] text-white/30 underline cursor-pointer">Internet tezligi testi</p>
      </div>
    </div>
  )
}
