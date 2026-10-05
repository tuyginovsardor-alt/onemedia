"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Film,
  Tv,
  PlusCircle,
  CreditCard,
  CheckCircle,
  XCircle,
  Users,
  Send,
  Radio,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Eye,
  LogOut,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react'
import type { MediaItem } from "@/lib/anime-store"
import type { AdminUser, PaymentCard, SubscriptionPlan, ManualReceipt } from "@/lib/admin-store"
import { SmartMediaAdder } from "@/components/smart-media-adder"
import { deleteMediaAction, reviewReceiptAction, addCardAction, removeCardAction, sendBroadcastAction } from "@/app/actions/admin-management"
import { cn } from "@/lib/utils"

export function DesktopAdminDashboard({
  allMedia,
  admins,
  cards,
  plans,
  receipts,
  currentAdminName,
}: {
  allMedia: MediaItem[]
  admins: AdminUser[]
  cards: PaymentCard[]
  plans: SubscriptionPlan[]
  receipts: ManualReceipt[]
  currentAdminName: string
}) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "media" | "add_media" | "receipts" | "cards" | "plans" | "broadcast">("dashboard")
  const [mediaSearch, setMediaSearch] = useState("")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "movie" | "anime" | "series">("all")
  const [selectedReceipt, setSelectedReceipt] = useState<ManualReceipt | null>(null)
  const [broadcastText, setBroadcastText] = useState("")
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null)

  const pendingReceipts = receipts.filter((r) => r.status === "pending")
  const moviesCount = allMedia.filter((m) => m.type === "movie").length
  const animeCount = allMedia.filter((m) => m.type === "anime").length
  const seriesCount = allMedia.filter((m) => m.type === "series").length

  const filteredMedia = allMedia.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      m.genres.some((g) => g.toLowerCase().includes(mediaSearch.toLowerCase()))
    const matchesType = mediaTypeFilter === "all" || m.type === mediaTypeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col md:flex-row">
      {/* LEFT SIDEBAR (Desktop PC focused) */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-[#0c0f1c] border-r border-white/10 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Studio Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ef4444] to-[#f43f5e] text-white font-black shadow-lg shadow-red-500/30">
              OM
            </div>
            <div>
              <h1 className="font-display text-base font-black tracking-tight text-white">OneMedia Studio</h1>
              <p className="text-[11px] text-white/50">Kompyuter Admin Paneli</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "dashboard" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Boshqaruv Markazi</span>
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "media" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Film className="h-4 w-4" />
                <span>Kinolar & Seriallar</span>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
                {allMedia.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("add_media")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "add_media" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              <span>Yangi Film / Anime Qo&apos;shish</span>
            </button>

            <button
              onClick={() => setActiveTab("receipts")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "receipts" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4" />
                <span>To&apos;lov Cheklari</span>
              </div>
              {pendingReceipts.length > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-black animate-pulse">
                  {pendingReceipts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("cards")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "cards" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <CreditCard className="h-4 w-4" />
              <span>To&apos;lov Kartalari</span>
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "plans" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Layers className="h-4 w-4" />
              <span>VIP Tariflar</span>
            </button>

            <button
              onClick={() => setActiveTab("broadcast")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left",
                activeTab === "broadcast" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>Telegram Xabarnoma</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className="px-2">
            <p className="text-[11px] text-white/50">Admin:</p>
            <p className="text-xs font-bold text-white truncate">{currentAdminName}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Saytni ko&apos;rish
            </Link>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA (PC / Desktop View) */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-white">Boshqaruv Markazi (Dashboard)</h2>
              <p className="text-xs text-white/60 mt-1">
                OneMedia kino portali statistikasi, faol kontentlar va kutilayotgan to&apos;lovlar.
              </p>
            </div>

            {/* Metric Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-[#121524] p-5 space-y-2">
                <div className="flex items-center justify-between text-white/50">
                  <span className="text-xs font-semibold">Jami Kontent</span>
                  <Film className="h-5 w-5 text-[#ef4444]" />
                </div>
                <p className="font-display text-3xl font-black text-white">{allMedia.length}</p>
                <p className="text-[11px] text-white/50">
                  {moviesCount} kino • {animeCount} anime • {seriesCount} serial
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#121524] p-5 space-y-2">
                <div className="flex items-center justify-between text-white/50">
                  <span className="text-xs font-semibold">Kutilayotgan Cheklar</span>
                  <CreditCard className="h-5 w-5 text-amber-400" />
                </div>
                <p className="font-display text-3xl font-black text-amber-300">{pendingReceipts.length}</p>
                <p className="text-[11px] text-white/50">Tasdiqlash kutilmoqda</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#121524] p-5 space-y-2">
                <div className="flex items-center justify-between text-white/50">
                  <span className="text-xs font-semibold">Faol Kartalar</span>
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="font-display text-3xl font-black text-emerald-400">{cards.filter((c) => c.active).length}</p>
                <p className="text-[11px] text-white/50">Uzcard & Humo to&apos;lov</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#121524] p-5 space-y-2">
                <div className="flex items-center justify-between text-white/50">
                  <span className="text-xs font-semibold">Rasmiy Kanal</span>
                  <Radio className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="font-display text-lg font-black text-white">@OneMediaRasmiy</p>
                <p className="text-[11px] text-emerald-400">Ulangan va faol ✅</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-white/10 bg-[#121524] p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-white">Tezkor Amallar</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setActiveTab("add_media")}
                  className="flex items-center gap-3 rounded-2xl bg-[#ef4444] p-4 text-white text-xs font-black shadow-lg shadow-red-500/20 hover:bg-[#dc2626] transition"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Yangi Film / Anime Qo&apos;shish</span>
                </button>

                <button
                  onClick={() => setActiveTab("receipts")}
                  className="flex items-center gap-3 rounded-2xl bg-[#161a29] border border-white/10 p-4 text-white text-xs font-bold hover:bg-white/10 transition"
                >
                  <CreditCard className="h-5 w-5 text-amber-400" />
                  <span>Cheklarni Tekshirish ({pendingReceipts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("broadcast")}
                  className="flex items-center gap-3 rounded-2xl bg-[#161a29] border border-white/10 p-4 text-white text-xs font-bold hover:bg-white/10 transition"
                >
                  <Send className="h-5 w-5 text-cyan-400" />
                  <span>Telegramga Xabar Yuborish</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KINOLAR & SERIALLAR BOSH IADVOLI */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-black text-white">Kinolar va Seriallar Bazasi</h2>
                <p className="text-xs text-white/60">Jami {allMedia.length} ta film, serial va anime mavjud.</p>
              </div>
              <button
                onClick={() => setActiveTab("add_media")}
                className="flex items-center gap-2 rounded-xl bg-[#ef4444] px-4 py-2 text-xs font-black text-white hover:bg-[#dc2626] transition"
              >
                <PlusCircle className="h-4 w-4" /> Yangi Qo&apos;shish
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Kino yoki anime nomini qidiring..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#121524] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#ef4444] focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5 rounded-2xl bg-[#121524] p-1 border border-white/10 text-xs font-bold">
                <button
                  onClick={() => setMediaTypeFilter("all")}
                  className={cn("px-3 py-1.5 rounded-xl transition", mediaTypeFilter === "all" ? "bg-white text-black" : "text-white/60 hover:text-white")}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setMediaTypeFilter("movie")}
                  className={cn("px-3 py-1.5 rounded-xl transition", mediaTypeFilter === "movie" ? "bg-white text-black" : "text-white/60 hover:text-white")}
                >
                  Kinolar
                </button>
                <button
                  onClick={() => setMediaTypeFilter("anime")}
                  className={cn("px-3 py-1.5 rounded-xl transition", mediaTypeFilter === "anime" ? "bg-white text-black" : "text-white/60 hover:text-white")}
                >
                  Anime
                </button>
                <button
                  onClick={() => setMediaTypeFilter("series")}
                  className={cn("px-3 py-1.5 rounded-xl transition", mediaTypeFilter === "series" ? "bg-white text-black" : "text-white/60 hover:text-white")}
                >
                  Seriallar
                </button>
              </div>
            </div>

            {/* Media Table */}
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#121524]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-white/50 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Film / Anime</th>
                    <th className="p-4">Turi</th>
                    <th className="p-4">Yil / Reyting</th>
                    <th className="p-4">Qismlar</th>
                    <th className="p-4">Sifat</th>
                    <th className="p-4">Kirish</th>
                    <th className="p-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMedia.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-black/60">
                          <Image src={item.poster || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.title}</p>
                          <p className="text-[11px] text-white/50">{item.genres.join(", ")}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-black uppercase",
                          item.type === "anime" ? "bg-purple-500/20 text-purple-300" :
                          item.type === "series" ? "bg-blue-500/20 text-blue-300" :
                          "bg-emerald-500/20 text-emerald-300"
                        )}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 text-white/70">
                        {item.year} • ⭐ {item.rating}
                      </td>
                      <td className="p-4 text-white/70">
                        {item.episodes.length} qism
                      </td>
                      <td className="p-4 font-bold text-[#ef4444]">{item.quality}</td>
                      <td className="p-4">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          item.accessType === "subscription" ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/20 text-emerald-300"
                        )}>
                          {item.accessType === "subscription" ? "Premium" : "Bepul"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/film/${item.id}`}
                            target="_blank"
                            className="p-1 text-white/50 hover:text-white transition"
                            title="Ko'rish"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <form action={async () => {
                            await deleteMediaAction(item.id)
                          }}>
                            <button
                              type="submit"
                              className="p-1 text-red-400 hover:text-red-300 transition"
                              title="O'chirish"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: YANGI FILM / ANIME QO'SHISH FORMASI */}
        {activeTab === "add_media" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="font-display text-2xl font-black text-white">Yangi Film / Anime Qo&apos;shish</h2>
              <p className="text-xs text-white/60 mt-1">
                Telegram File ID orqali video oqimni to&apos;g&apos;ridan-to&apos;g&apos;ri biriktiring yoki ko&apos;p qismli anime/serial yarating.
              </p>
            </div>

            <SmartMediaAdder />
          </div>
        )}

        {/* TAB 4: TO'LOV CHEKLARI (RECEIPTS) */}
        {activeTab === "receipts" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black text-white">To&apos;lov Cheklari va Arizalar</h2>
              <p className="text-xs text-white/60 mt-1">
                Foydalanuvchilar tomonidan yuborilgan to&apos;lov cheklarini tekshirish va tasdiqlash.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#121524]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-white/50 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Foydalanuvchi</th>
                    <th className="p-4">Tarif</th>
                    <th className="p-4">Summa</th>
                    <th className="p-4">Chek Rasmi</th>
                    <th className="p-4">Holat</th>
                    <th className="p-4 text-right">Tasdiqlash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {receipts.map((rc) => (
                    <tr key={rc.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4">
                        <p className="font-bold text-white">{rc.userDisplayName || "Foydalanuvchi"}</p>
                        <p className="text-[11px] text-white/50">{rc.userTelegram || rc.userEmail || rc.userId}</p>
                      </td>
                      <td className="p-4 font-semibold text-white">{rc.planName}</td>
                      <td className="p-4 font-bold text-amber-300">{rc.amountUzs.toLocaleString()} UZS</td>
                      <td className="p-4">
                        {rc.receiptImageUrl ? (
                          <button
                            onClick={() => setSelectedReceipt(rc)}
                            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-white/20"
                          >
                            <Eye className="h-3.5 w-3.5" /> Chekni ko&apos;rish
                          </button>
                        ) : (
                          <span className="text-white/40">Mavjud emas</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold",
                          rc.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                          rc.status === "rejected" ? "bg-red-500/20 text-red-400" :
                          "bg-amber-500/20 text-amber-300"
                        )}>
                          {rc.status === "approved" ? "Tasdiqlangan" : rc.status === "rejected" ? "Rad etilgan" : "Kutilmoqda"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {rc.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <form action={async () => {
                              await reviewReceiptAction(rc.id, "approved", "To'lov qabul qilindi")
                            }}>
                              <button
                                type="submit"
                                className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-black hover:bg-emerald-400 shadow-md transition"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Tasdiqlash
                              </button>
                            </form>
                            <form action={async () => {
                              await reviewReceiptAction(rc.id, "rejected", "Chek mos kelmadi")
                            }}>
                              <button
                                type="submit"
                                className="flex items-center gap-1 rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 transition"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Rad etish
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TO'LOV KARTALARI (CARDS) */}
        {activeTab === "cards" && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-display text-2xl font-black text-white">To&apos;lov Kartalari Boshqaruvi</h2>
              <p className="text-xs text-white/60 mt-1">
                Saytda va botda ko&apos;rsatiladigan Uzcard va Humo bank kartalarini boshqaring.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((cd) => (
                <div key={cd.id} className="rounded-3xl border border-white/10 bg-[#121524] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{cd.bankName}</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">{cd.paymentType}</span>
                  </div>
                  <p className="font-mono text-lg font-bold text-cyan-300">{cd.cardNumber}</p>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{cd.cardHolder}</span>
                    <form action={async () => {
                      await removeCardAction(cd.id)
                    }}>
                      <button type="submit" className="text-red-400 hover:text-red-300 font-semibold text-xs">
                        O&apos;chirish
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TARIFLAR */}
        {activeTab === "plans" && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-display text-2xl font-black text-white">VIP Tariflar</h2>
              <p className="text-xs text-white/60 mt-1">
                7 kunlik, 1 oylik va 3 oylik VIP tariflari.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {plans.map((pl) => (
                <div key={pl.id} className="rounded-3xl border border-white/10 bg-[#121524] p-5 space-y-3">
                  <h3 className="font-display text-lg font-black text-white">{pl.name}</h3>
                  <p className="font-display text-xl font-black text-amber-300">
                    {pl.amountUzs.toLocaleString()} UZS
                  </p>
                  <p className="text-xs text-white/50">{pl.durationDays} kun amal qiladi</p>
                  <ul className="space-y-1 text-xs text-white/70">
                    {pl.features.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BROADCAST TO TELEGRAM */}
        {activeTab === "broadcast" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="font-display text-2xl font-black text-white">Telegram Bot Xabarnoma (Broadcast)</h2>
              <p className="text-xs text-white/60 mt-1">
                Barcha bot foydalanuvchilariga yangi premyeralar yoki xabarlarni yuboring.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#121524] p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-2">Xabar matni (HTML formatida):</label>
                <textarea
                  rows={6}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="🎬 Yangi premyera: Naruto Shippuden 4K sifatda saytimizga joylandi!..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white placeholder:text-white/40 focus:border-[#ef4444] focus:outline-none"
                />
              </div>

              <button
                onClick={async () => {
                  if (!broadcastText.trim()) return
                  setBroadcastStatus("Yuborilmoqda...")
                  const res = await sendBroadcastAction(broadcastText)
                  if (res.success) {
                    setBroadcastStatus("✅ Xabar muvaffaqiyatli yuborildi!")
                    setBroadcastText("")
                  } else {
                    setBroadcastStatus("❌ Xatolik yuz berdi: " + (res.error || "Noma'lum"))
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#ef4444] px-6 py-3 text-xs font-black text-white hover:bg-[#dc2626] transition shadow-lg shadow-red-500/20"
              >
                <Send className="h-4 w-4" />
                Telegram Botga Yuborish
              </button>

              {broadcastStatus && (
                <p className="text-xs font-bold text-amber-300">{broadcastStatus}</p>
              )}
            </div>
          </div>
        )}

        {/* Receipt Image Preview Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[#121524] p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">To&apos;lov Cheki</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-full bg-white/10 p-2 text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src={selectedReceipt.receiptImageUrl}
                  alt="Chek"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="text-xs space-y-1 text-white/70">
                <p>Foydalanuvchi: <b className="text-white">{selectedReceipt.userDisplayName}</b></p>
                <p>Summa: <b className="text-amber-300">{selectedReceipt.amountUzs.toLocaleString()} UZS</b></p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
