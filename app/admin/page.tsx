import {
  getAdmins,
  getSponsorChannels,
  getPaymentCards,
  getSubscriptionPlans,
  getManualReceipts,
  getBroadcasts,
} from "@/lib/admin-store"
import { getAllMedia, setAllMedia } from "@/lib/anime-store"
import { fetchAllMediaFromNeon } from "@/lib/db/media-db"
import {
  createMediaAction,
  deleteMediaAction,
  addAdminAction,
  removeAdminAction,
  addSponsorAction,
  removeSponsorAction,
  addCardAction,
  toggleCardAction,
  removeCardAction,
  reviewReceiptAction,
  sendBroadcastAction,
} from "@/app/actions/admin-management"
import Link from "next/link"
import { redirect } from "next/navigation"
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
  BarChart3,
  Layers,
  Settings,
  LogOut,
} from 'lucide-react'
import { verifyAdminSignature, getAdminSessionFromCookie, getAdminProfileDetails } from "@/lib/admin-auth"
import { AdminAuthGate } from "@/components/admin-auth-gate"
import { logoutAdminAction } from "@/app/actions/admin-auth-actions"
import { SmartMediaAdder } from "@/components/smart-media-adder"
import { AdminProfileBanner } from "@/components/admin-profile-banner"

export default async function WebAdminStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; ts?: string; sig?: string }>
}) {
  const { uid, ts, sig } = await searchParams

  // 1. If SHA-256 Token from Telegram query, redirect to Route Handler to set cookie safely
  if (uid && ts && sig) {
    redirect(`/api/auth/admin-verify?uid=${uid}&ts=${ts}&sig=${sig}&target=web`)
  }

  // 2. Check 30-day Cookie Session Cache
  const session = await getAdminSessionFromCookie()
  const isAuthenticated = Boolean(session?.authenticated)

  // 3. Block unauthorized access with AdminAuthGate
  if (!isAuthenticated) {
    return <AdminAuthGate returnUrl="/admin" />
  }

  const adminProfile = getAdminProfileDetails(session?.identifier)

  let allMedia = await fetchAllMediaFromNeon()
  if (allMedia.length > 0) {
    setAllMedia(allMedia)
  } else {
    allMedia = getAllMedia()
  }
  const admins = getAdmins()
  const sponsors = getSponsorChannels()
  const cards = getPaymentCards()
  const plans = getSubscriptionPlans()
  const receipts = getManualReceipts()
  const broadcasts = getBroadcasts()

  const animeList = allMedia.filter((m) => m.type === "anime")
  const moviesList = allMedia.filter((m) => m.type === "movie" || m.type === "series")
  const pendingReceipts = receipts.filter((r) => r.status === "pending")

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-400/20">
              OM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold text-white tracking-tight">OneMedia Studio</h1>
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-400/30">
                  WEB ADMIN
                </span>
              </div>
              <p className="text-xs text-white/50">Filmlar, Anime, To&apos;lovlar va Tizim boshqaruvi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/tg"
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
            >
              📱 Telegram Mini App ko&apos;rinishi
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10"
            >
              ← Saytga qaytish
            </Link>
            <form action={async () => {
              'use server'
              await logoutAdminAction("/admin")
            }}>
              <button
                type="submit"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Chiqish
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 space-y-8">
        {/* Admin Identity Banner */}
        <AdminProfileBanner admin={adminProfile} currentView="web" />

        {/* Metric Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-medium">Barcha Kontent</span>
              <Film className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{allMedia.length}</p>
            <p className="mt-1 text-xs text-cyan-400">{animeList.length} anime • {moviesList.length} kino</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-medium">Kutilayotgan Cheklar</span>
              <CreditCard className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-black text-amber-400">{pendingReceipts.length}</p>
            <p className="mt-1 text-xs text-white/50">Tasdiqlash kutilmoqda</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-medium">Faol Adminlar</span>
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{admins.length}</p>
            <p className="mt-1 text-xs text-emerald-400">Super Admin & Moderatorlar</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-medium">Majburiy Kanallar</span>
              <Radio className="h-5 w-5 text-purple-400" />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{sponsors.length}</p>
            <p className="mt-1 text-xs text-purple-400">Bot & Sayt tekshiruvi faol</p>
          </div>
        </section>

        {/* Section 1: Film & Anime Manager */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="h-5 w-5 text-cyan-400" /> Filmlar va Anime Boshqaruvi
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Telegram File ID orqali video oqimni (streaming) to&apos;g&apos;ridan-to&apos;g&apos;ri ulash va qismlarni boshqarish.
              </p>
            </div>
          </div>

          {/* Smart Media Adder with Auto-Parser & Bulk Anime Ingestion */}
          <SmartMediaAdder />

          {/* Media Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-white/50 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Nomi & Janr</th>
                  <th className="p-3">Turi</th>
                  <th className="p-3">Yil / Reyting</th>
                  <th className="p-3">Qismlar</th>
                  <th className="p-3">Sifat</th>
                  <th className="p-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allMedia.slice(0, 15).map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="p-3">
                      <p className="font-semibold text-white">{m.title}</p>
                      <p className="text-[11px] text-white/50">{m.genres.join(", ")}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.type === "anime" ? "bg-purple-400/20 text-purple-300" : "bg-cyan-400/20 text-cyan-300"}`}>
                        {m.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-white/70">
                      {m.year} • ⭐ {m.rating}
                    </td>
                    <td className="p-3 text-white/70">
                      {m.episodes.length} qism
                    </td>
                    <td className="p-3 font-semibold text-cyan-400">{m.quality}</td>
                    <td className="p-3 text-right">
                      <form
                        action={async () => {
                          'use server'
                          await deleteMediaAction(m.id)
                        }}
                      >
                        <button type="submit" className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Admin Management (RBAC) */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" /> Adminlar va Moderatorlar Boshqaruvi (RBAC)
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Boshqa foydalanuvchilarni email yoki Telegram username/ID orqali admin qilib tayinlash.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Admin Add Form */}
            <form action={addAdminAction} className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4 space-y-3">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">+ Yangi Admin Qo&apos;shish</p>
              <div>
                <label className="text-xs text-white/70 block mb-1">To&apos;liq ismi</label>
                <input
                  name="name"
                  required
                  placeholder="masalan: Alisher Qodirov"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Email yoki Telegram ID / Username</label>
                <input
                  name="identifier"
                  required
                  placeholder="@username yoki admin@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Vakolat darajasi</label>
                <select
                  name="role"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                >
                  <option value="admin">Administrator (To&apos;liq boshqaruv)</option>
                  <option value="moderator">Moderator (Faqat cheklar va kinolar)</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
              >
                Admin qilish
              </button>
            </form>

            {/* Admins List */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-xs font-bold text-white/70 uppercase">Mavjud Adminlar Ro&apos;yxati ({admins.length})</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {admins.map((ad) => (
                  <div key={ad.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">{ad.name}</p>
                      <p className="text-xs font-mono text-emerald-400 mt-0.5">{ad.identifier}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="rounded bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                          {ad.role}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {ad.type === "telegram" ? "Telegram" : "Email"}
                        </span>
                      </div>
                    </div>

                    {ad.id !== "admin-sardor-email" && (
                      <form
                        action={async () => {
                          'use server'
                          await removeAdminAction(ad.id)
                        }}
                      >
                        <button type="submit" className="text-red-400 hover:text-red-300 p-2">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Mandatory Channels & Payment Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mandatory Channels */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-purple-400" /> Majburiy Kanal va Guruhlar
            </h2>
            <p className="text-xs text-white/60">
              Foydalanuvchilar kinolarni ko&apos;rishdan oldin a&apos;zo bo&apos;lishlari shart bo&apos;lgan kanallar.
            </p>

            <form action={addSponsorAction} className="rounded-xl border border-purple-400/20 bg-purple-400/[0.03] p-3.5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="title"
                  required
                  placeholder="Kanal nomi"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
                <input
                  name="username"
                  required
                  placeholder="@onemedia_kino"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-purple-500 py-2 text-xs font-bold text-slate-950 hover:bg-purple-400"
              >
                + Kanal qo&apos;shish
              </button>
            </form>

            <div className="space-y-2">
              {sponsors.map((sp) => (
                <div key={sp.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <div>
                    <p className="font-bold text-white">{sp.title}</p>
                    <p className="text-purple-300 font-mono text-[11px]">{sp.username}</p>
                  </div>
                  <form
                    action={async () => {
                      'use server'
                      await removeSponsorAction(sp.id)
                    }}
                  >
                    <button type="submit" className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Cards */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-cyan-400" /> To&apos;lov Kartalari Sozlamasi
            </h2>
            <p className="text-xs text-white/60">
              Foydalanuvchilar obuna to&apos;lovini o&apos;tkazishlari uchun faol Uzcard / Humo kartalar.
            </p>

            <form action={addCardAction} className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-3.5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="bankName"
                  required
                  placeholder="Bank nomi (TBC)"
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
                  placeholder="8600 1234 5678 9010"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white font-mono"
                />
                <input
                  name="cardHolder"
                  required
                  placeholder="SARDOR TUYGINOV"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"
              >
                + Karta qo&apos;shish
              </button>
            </form>

            <div className="space-y-2">
              {cards.map((cd) => (
                <div key={cd.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <div>
                    <p className="font-bold text-white">{cd.bankName} ({cd.paymentType})</p>
                    <p className="text-cyan-300 font-mono text-xs mt-0.5">{cd.cardNumber}</p>
                    <p className="text-[10px] text-white/50">{cd.cardHolder}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                      <button type="submit" className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Section 4: Manual Receipts Verification */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-400" /> Qo&apos;lda To&apos;lov Cheklarini Tasdiqlash ({pendingReceipts.length})
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Foydalanuvchilar yuborgan to&apos;lov chek skrinshotlarini ko&apos;rish va tasdiqlash.
              </p>
            </div>
          </div>

          {receipts.length === 0 ? (
            <p className="text-xs text-white/40 py-4">To&apos;lov cheklari mavjud emas.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {receipts.map((rc) => (
                <div key={rc.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">{rc.userDisplayName}</p>
                      <p className="text-xs text-cyan-300 font-medium">{rc.userTelegram || rc.userEmail || "Mijoz"}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rc.status === "approved" ? "bg-emerald-400/20 text-emerald-300" : rc.status === "rejected" ? "bg-red-400/20 text-red-300" : "bg-amber-400/20 text-amber-300"}`}>
                      {rc.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="rounded-lg bg-black/40 p-2.5 text-xs space-y-1">
                    <p><span className="text-white/40">Tarif:</span> <b className="text-white">{rc.planName}</b></p>
                    <p><span className="text-white/40">Summa:</span> <b className="text-amber-300">{rc.amountUzs.toLocaleString()} UZS</b></p>
                    {rc.transactionNote && <p><span className="text-white/40">Izoh:</span> {rc.transactionNote}</p>}
                  </div>

                  {rc.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      <form
                        action={async () => {
                          'use server'
                          await reviewReceiptAction(rc.id, "approved", "To'lovingiz qabul qilindi!")
                        }}
                        className="flex-1"
                      >
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Tasdiqlash
                        </button>
                      </form>

                      <form
                        action={async () => {
                          'use server'
                          await reviewReceiptAction(rc.id, "rejected", "Chek ma'lumotlari mos kelmadi.")
                        }}
                        className="flex-1"
                      >
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Rad etish
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Broadcast Announcements */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-cyan-400" /> Barcha Foydalanuvchilarga E&apos;lon va Yangilik Tashlash (Broadcast)
          </h2>
          <form action={sendBroadcastAction} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <input
              name="title"
              required
              placeholder="E'lon sarlavhasi"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Xabarnoma matni (barcha bot foydalanuvchilariga yetkaziladi)..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="buttonText"
                placeholder="Tugma matni (masalan: 🎬 Ko'rish)"
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
              />
              <input
                name="buttonUrl"
                placeholder="https://onemedia-mocha.vercel.app/catalog"
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 flex items-center gap-2"
            >
              <Send className="h-4 w-4" /> E&apos;lonni yuborish
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
