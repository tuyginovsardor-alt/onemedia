import {
  getAdmins,
  getSponsorChannels,
  getPaymentCards,
  getSubscriptionPlans,
  getManualReceipts,
  getBroadcasts,
} from "@/lib/admin-store"
import { getAllMedia } from "@/lib/anime-store"
import {
  createMediaAction,
  deleteMediaAction,
  addAdminAction,
  removeAdminAction,
  addSponsorAction,
  removeSponsorAction,
  addCardAction,
  toggleCardAction,
  reviewReceiptAction,
  sendBroadcastAction,
} from "@/app/actions/admin-management"
import Link from "next/link"
import {
  Film,
  Tv,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Send,
  Radio,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default async function TelegramAdminAppPage() {
  const allMedia = getAllMedia()
  const admins = getAdmins()
  const sponsors = getSponsorChannels()
  const cards = getPaymentCards()
  const receipts = getManualReceipts()
  const broadcasts = getBroadcasts()
  const pendingReceipts = receipts.filter((r) => r.status === "pending")

  const animeCount = allMedia.filter((m) => m.type === "anime").length
  const movieCount = allMedia.filter((m) => m.type === "movie" || m.type === "series").length

  return (
    <div className="min-h-screen bg-[#070913] text-white pb-24">
      {/* Mobile Header for Telegram WebApp */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#070913]/90 backdrop-blur px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-400 border border-cyan-400/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              OneMedia Admin <span className="rounded bg-cyan-400/20 px-1.5 py-0.2 text-[10px] font-bold text-cyan-400">TG APP</span>
            </h1>
            <p className="text-[11px] text-white/50">Telegram Boshqaruv Markazi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/10 flex items-center gap-1"
          >
            Veb Studio <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs">🎬 Filmlar & Anime</span>
              <Film className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">{allMedia.length}</p>
            <p className="text-[10px] text-cyan-400 mt-0.5">{animeCount} anime, {movieCount} film</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs">💳 Kutilayotgan Cheklar</span>
              <CreditCard className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{pendingReceipts.length}</p>
            <p className="text-[10px] text-white/50 mt-0.5">tasdiqlash kutilmoqda</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs">👑 Adminlar</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{admins.length} ta</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">to&apos;liq vakolatli</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs">📢 Majburiy Kanal</span>
              <Radio className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">{sponsors.length} ta</p>
            <p className="text-[10px] text-purple-400 mt-0.5">obuna talabi faol</p>
          </div>
        </div>

        {/* 1. Pending Receipts (Review with 1 tap) */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-amber-400" /> To&apos;lov cheklarini tasdiqlash ({pendingReceipts.length})
            </h2>
          </div>

          {pendingReceipts.length === 0 ? (
            <p className="text-xs text-white/40 py-2">Hozircha yangi kutilayotgan cheklar yo&apos;q.</p>
          ) : (
            <div className="space-y-3">
              {pendingReceipts.map((rc) => (
                <div key={rc.id} className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{rc.userDisplayName}</p>
                      <p className="text-[11px] text-amber-300 font-medium">{rc.userTelegram || rc.userEmail || "Foydalanuvchi"}</p>
                    </div>
                    <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                      {rc.amountUzs.toLocaleString()} so&apos;m
                    </span>
                  </div>

                  <p className="text-[11px] text-white/60">
                    Tarif: <b>{rc.planName}</b> • {rc.transactionNote || "Chek yuklandi"}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <form
                      action={async () => {
                        'use server'
                        await reviewReceiptAction(rc.id, "approved", "To'lov tasdiqlandi")
                      }}
                      className="flex-1"
                    >
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-slate-950 active:scale-95"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Tasdiqlash
                      </button>
                    </form>

                    <form
                      action={async () => {
                        'use server'
                        await reviewReceiptAction(rc.id, "rejected", "Chek noaniq")
                      }}
                      className="flex-1"
                    >
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-400 active:scale-95"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Rad etish
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Add New Anime / Movie */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
            <Tv className="h-4 w-4 text-cyan-400" /> Yangi Anime yoki Film qo&apos;shish
          </h2>
          <p className="text-[11px] text-white/50 mb-3">
            Telegram File ID kiritilsa, bot va pleyer uni to&apos;g&apos;ridan-to&apos;g&apos;ri 4K oqim bilan uzatadi.
          </p>

          <form action={createMediaAction} className="space-y-2.5">
            <div>
              <label className="text-[11px] text-white/60 block mb-1">Nomi:</label>
              <input
                name="title"
                required
                placeholder="masalan: Solo Leveling 2-mavsum"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Turi:</label>
                <select
                  name="type"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="anime">Anime</option>
                  <option value="movie">Film</option>
                  <option value="series">Serial</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-white/60 block mb-1">Sifati:</label>
                <select
                  name="quality"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="4K">4K Ultra HD</option>
                  <option value="FHD">Full HD 1080p</option>
                  <option value="HD">HD 720p</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Yili:</label>
                <input
                  name="year"
                  type="number"
                  defaultValue={2025}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Reyting:</label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  defaultValue={8.8}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Qismlar soni:</label>
                <input
                  name="totalEpisodes"
                  type="number"
                  defaultValue={12}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/60 block mb-1">Janrlar (vergul bilan):</label>
              <input
                name="genres"
                defaultValue="Anime, Jangari, Fantastika"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-white/60 block mb-1">Telegram File ID (Storage):</label>
              <input
                name="telegramFileId"
                placeholder="Telegram video file_id (ixtiyoriy)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-cyan-300 placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-white/60 block mb-1">Tavsif (Synopsis):</label>
              <textarea
                name="synopsis"
                rows={2}
                placeholder="Qisqacha mazmuni..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-400 py-2.5 text-xs font-extrabold text-slate-950 flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-cyan-400/20"
            >
              <Plus className="h-4 w-4" /> Bazaga qo&apos;shish
            </button>
          </form>
        </section>

        {/* 3. Mandatory Channels (Sponsors) */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-purple-400" /> Majburiy Kanallar ({sponsors.length})
            </h2>
          </div>
          <p className="text-[11px] text-white/50 mb-3">
            Foydalanuvchilar kinolarni ko&apos;rishdan oldin ushbu kanallarga a&apos;zo bo&apos;lishlari shart bo&apos;ladi.
          </p>

          <div className="space-y-2 mb-3">
            {sponsors.map((sp) => (
              <div key={sp.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                <div>
                  <p className="font-semibold text-white">{sp.title}</p>
                  <p className="text-purple-300 text-[11px]">{sp.username}</p>
                </div>
                <form
                  action={async () => {
                    'use server'
                    await removeSponsorAction(sp.id)
                  }}
                >
                  <button type="submit" className="p-1.5 text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form action={addSponsorAction} className="space-y-2 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <input
                name="title"
                required
                placeholder="Kanal nomi"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
              />
              <input
                name="username"
                required
                placeholder="@kanal_username"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl border border-purple-400/30 bg-purple-400/10 py-2 text-xs font-bold text-purple-300 hover:bg-purple-400/20"
            >
              + Majburiy kanal qo&apos;shish
            </button>
          </form>
        </section>

        {/* 4. Admins Management */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-400" /> Adminlar Boshqaruvi ({admins.length})
            </h2>
          </div>
          <p className="text-[11px] text-white/50 mb-3">
            Boshqa xodimlar yoki do&apos;stlaringizni bot va saytga admin qilib tayinlashingiz mumkin.
          </p>

          <div className="space-y-2 mb-3">
            {admins.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                <div>
                  <p className="font-semibold text-white">{ad.name}</p>
                  <p className="text-emerald-400 text-[11px] font-mono">{ad.identifier}</p>
                  <span className="text-[10px] text-white/40 uppercase">{ad.role}</span>
                </div>
                {ad.id !== "admin-sardor-email" && (
                  <form
                    action={async () => {
                      'use server'
                      await removeAdminAction(ad.id)
                    }}
                  >
                    <button type="submit" className="p-1.5 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          <form action={addAdminAction} className="space-y-2 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <input
                name="name"
                required
                placeholder="Admin ismi"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
              />
              <input
                name="identifier"
                required
                placeholder="@username yoki email"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/20"
            >
              + Yangi admin qo&apos;shish
            </button>
          </form>
        </section>

        {/* 5. Payment Cards Settings */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
            <CreditCard className="h-4 w-4 text-cyan-400" /> To&apos;lov kartalari
          </h2>
          <div className="space-y-2 mb-3">
            {cards.map((cd) => (
              <div key={cd.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                <div>
                  <p className="font-semibold text-white">{cd.bankName} ({cd.paymentType})</p>
                  <p className="text-cyan-300 font-mono text-xs">{cd.cardNumber}</p>
                  <p className="text-[10px] text-white/50">{cd.cardHolder}</p>
                </div>
                <div className="flex items-center gap-1">
                  <form
                    action={async () => {
                      'use server'
                      await toggleCardAction(cd.id)
                    }}
                  >
                    <button
                      type="submit"
                      className={`px-2 py-1 rounded text-[10px] font-bold ${cd.active ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/40"}`}
                    >
                      {cd.active ? "Faol" : "O'chiq"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      'use server'
                      await removeCardAction(cd.id)
                    }}
                  >
                    <button type="submit" className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <form action={addCardAction} className="space-y-2 pt-2 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              <input
                name="bankName"
                required
                placeholder="Bank nomi (masalan: TBC)"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              />
              <select
                name="paymentType"
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="Uzcard">Uzcard</option>
                <option value="Humo">Humo</option>
                <option value="Click">Click</option>
                <option value="Payme">Payme</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="cardNumber"
                required
                placeholder="8600 ...."
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white font-mono"
              />
              <input
                name="cardHolder"
                required
                placeholder="ISMI FAMILIYASI"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white uppercase"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20"
            >
              + Karta qo&apos;shish
            </button>
          </form>
        </section>

        {/* 6. Broadcast Announcement */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
            <Send className="h-4 w-4 text-cyan-400" /> Barcha foydalanuvchilarga xabarnoma (Broadcast)
          </h2>
          <form action={sendBroadcastAction} className="space-y-2.5">
            <input
              name="title"
              required
              placeholder="Xabar sarlavhasi"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
            />
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Xabar matni..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="buttonText"
                placeholder="Tugma matni (ixtiyoriy)"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
              />
              <input
                name="buttonUrl"
                placeholder="https://..."
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-400 py-2.5 text-xs font-extrabold text-slate-950 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Send className="h-3.5 w-3.5" /> Barchaga yuborish
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
