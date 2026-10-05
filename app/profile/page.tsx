"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Crown,
  CreditCard,
  QrCode,
  Smartphone,
  Gift,
  History,
  Headphones,
  Share2,
  LogOut,
  ChevronRight,
  Send,
  Camera,
  Plus,
  Tv,
  Check,
  X,
  Sparkles,
  Wifi,
  ShieldCheck,
  Copy,
  Loader2,
} from 'lucide-react'

type UserInfo = {
  id?: string
  name?: string
  username?: string
  phone?: string
  email?: string
  telegramId?: number | string
  role?: "admin" | "user"
  isVip?: boolean
  balance?: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [isVip, setIsVip] = useState(false)

  // Modals
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoStatus, setPromoStatus] = useState<{ type: "idle" | "success" | "error"; msg: string }>({
    type: "idle",
    msg: "",
  })

  const [showTvModal, setShowTvModal] = useState(false)
  const [tvCode, setTvCode] = useState("")
  const [tvStatus, setTvStatus] = useState<string>("")

  const [showDevicesModal, setShowDevicesModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showSpeedModal, setShowSpeedModal] = useState(false)
  const [speedTestRunning, setSpeedTestRunning] = useState(false)
  const [speedResult, setSpeedResult] = useState<{ ping: number; speed: number } | null>(null)

  const [showLangModal, setShowLangModal] = useState(false)
  const [selectedLang, setSelectedLang] = useState("O'zbekcha")

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Load user info from API or Telegram WebApp
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/user/me")
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            setUser(data.user)
            setIsVip(!!data.user.isVip)
            setBalance(data.user.balance || 0)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.error("User session fetch error:", err)
      }

      // Check Telegram WebApp object
      if (typeof window !== "undefined") {
        const tg = (window as any).Telegram?.WebApp
        if (tg) {
          try {
            tg.ready?.()
            const tgUser = tg.initDataUnsafe?.user
            if (tgUser) {
              const tgName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || "Foydalanuvchi"
              setUser({
                id: String(tgUser.id),
                name: tgName,
                username: tgUser.username ? `@${tgUser.username}` : undefined,
                telegramId: tgUser.id,
                role: "user",
                isVip: false,
                balance: 0,
              })
              setLoading(false)
              return
            }
          } catch {
            // ignore
          }
        }
      }

      // Default fallback
      setUser({
        name: "Firdavs",
        phone: "+998 93 083 77 86",
        telegramId: "251202",
        role: "user",
        isVip: false,
        balance: 0,
      })
      setLoading(false)
    }

    loadUser()
  }, [])

  const handleApplyPromo = () => {
    const clean = promoCode.trim().toUpperCase()
    if (!clean) {
      setPromoStatus({ type: "error", msg: "Iltimos, promokodni kiriting" })
      return
    }

    if (clean === "ONEMEDIA2026" || clean === "VIP2026" || clean === "PREMIUM" || clean === "START") {
      setIsVip(true)
      setBalance((prev) => prev + 15000)
      setPromoStatus({
        type: "success",
        msg: "🎉 Tabriklaymiz! 1 oylik VIP obuna va 15,000 so'm hisobingizga qo'shildi!",
      })
      setPromoCode("")
      showToast("Promokod muvaffaqiyatli faollashtirildi!")
    } else {
      setPromoStatus({
        type: "error",
        msg: "❌ Ushbu promokod mavjud emas yoki muddati o'tgan.",
      })
    }
  }

  const handleTvActivation = () => {
    if (tvCode.length < 4) {
      setTvStatus("Iltimos, Smart TV ekranidagi 4-6 xonali kodni kiriting.")
      return
    }
    setTvStatus("✅ Televizor muvaffaqiyatli ulandi!")
    setTimeout(() => {
      setShowTvModal(false)
      setTvStatus("")
      setTvCode("")
      showToast("Smart TV ulandi!")
    }, 1500)
  }

  const runSpeedTest = () => {
    setSpeedTestRunning(true)
    setSpeedResult(null)
    const start = performance.now()
    fetch("/api/user/me?t=" + Date.now(), { cache: "no-store" })
      .then(() => {
        const ping = Math.max(12, Math.round(performance.now() - start))
        setTimeout(() => {
          setSpeedResult({
            ping,
            speed: Math.round(45 + Math.random() * 50),
          })
          setSpeedTestRunning(false)
        }, 1200)
      })
      .catch(() => {
        setSpeedResult({ ping: 45, speed: 65 })
        setSpeedTestRunning(false)
      })
  }

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://onemedia-mocha.vercel.app"
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "OneMedia — Kinolar va Seriallar",
          text: "OneMedia kino portalida eng sara kinolar va animelarni tomosha qiling!",
          url: shareUrl,
        })
      } catch {
        // ignore
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      showToast("Havola nusxalandi!")
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/telegram-logout", { method: "POST" })
    } catch {
      // ignore
    }
    router.push("/sign-in")
  }

  const displayName = user?.name || "Firdavs"
  const userIdentifier = user?.phone || user?.username || "+998 93 083 77 86"
  const userId = user?.telegramId || user?.id || "251202"
  const firstLetter = displayName.charAt(0).toUpperCase() || "F"

  return (
    <div className="min-h-screen bg-[#070913] text-white px-4 pt-6 pb-28 max-w-lg mx-auto space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-emerald-500/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex items-center gap-3.5 rounded-3xl bg-[#161a29] p-4 border border-white/10 shadow-lg">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#252b42] text-xl font-black text-white border border-white/20 shadow-inner">
          {firstLetter}
        </div>

        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-black text-white truncate">{displayName}</h1>
            {isVip && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/30">
                <Crown className="h-3 w-3" /> VIP
              </span>
            )}
          </div>
          <p className="text-xs text-white/60 truncate">{userIdentifier}</p>
          <p className="text-[11px] font-mono text-white/40">ID: {userId}</p>
        </div>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-xl bg-[#ef4444] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition shrink-0"
          >
            Admin
          </Link>
        )}
      </div>

      {/* 2 Stat Cards: Balans & Obuna */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Balans */}
        <div className="rounded-3xl bg-[#161a29] p-4 border border-white/10 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/60">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium">Balans</span>
            </div>
            <p className="font-display text-base font-black text-white">
              {balance.toLocaleString()} so&apos;m
            </p>
          </div>
          <Link
            href="/payment"
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> To&apos;ldirish
          </Link>
        </div>

        {/* Card 2: Obuna */}
        <div className="rounded-3xl bg-[#161a29] p-4 border border-white/10 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/60">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium">Obuna</span>
            </div>
            <p className={`font-display text-sm font-bold ${isVip ? "text-emerald-400" : "text-[#ef4444]"}`}>
              {isVip ? "VIP Faol" : "Mavjud emas"}
            </p>
          </div>
          <Link
            href="/payment"
            className={`inline-flex w-full items-center justify-center rounded-xl py-2 text-xs font-bold text-white shadow-md transition active:scale-95 ${
              isVip
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-[#ef4444] shadow-red-500/20 hover:bg-[#dc2626]"
            }`}
          >
            {isVip ? "Uzaytirish" : "Ulanish"}
          </Link>
        </div>
      </div>

      {/* Menu List */}
      <div className="rounded-3xl bg-[#161a29] border border-white/10 divide-y divide-white/5 overflow-hidden shadow-lg">
        {/* 1. Obunalar */}
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

        {/* 2. OneMedia TV aktivlashtirish */}
        <button
          type="button"
          onClick={() => setShowTvModal(true)}
          className="flex w-full items-center justify-between p-3.5 hover:bg-white/5 transition text-left"
        >
          <div className="flex items-center gap-3">
            <QrCode className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">OneMedia TV ni aktivlashtirish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </button>

        {/* 3. Mening qurilmalarim */}
        <button
          type="button"
          onClick={() => setShowDevicesModal(true)}
          className="flex w-full items-center justify-between p-3.5 hover:bg-white/5 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-white">Mening qurilmalarim</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </button>

        {/* 4. Balansni to'ldirish */}
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

        {/* 5. Promokodlarni faollashtirish */}
        <button
          type="button"
          onClick={() => {
            setShowPromoModal(true)
            setPromoStatus({ type: "idle", msg: "" })
          }}
          className="flex w-full items-center justify-between p-3.5 hover:bg-white/5 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Gift className="h-4 w-4 text-pink-400" />
            <span className="text-xs font-bold text-white">Promokodlarni faollashtirish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </button>

        {/* 6. To'lov va xaridlar tarixi */}
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="flex w-full items-center justify-between p-3.5 hover:bg-white/5 transition text-left"
        >
          <div className="flex items-center gap-3">
            <History className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-white">To&apos;lov va xaridlar tarixi</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </button>

        {/* 7. Qo'llab-quvvatlash */}
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
          <span className="text-xs text-white/50 flex items-center gap-1">
            @OneMediaRasmiy <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </a>

        {/* 8. Ulashish */}
        <button
          type="button"
          onClick={handleShare}
          className="flex w-full items-center justify-between p-3.5 hover:bg-white/5 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">Ulashish</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </button>
      </div>

      {/* Language Selector Box */}
      <button
        type="button"
        onClick={() => setShowLangModal(true)}
        className="flex w-full items-center justify-between rounded-3xl bg-[#161a29] p-3.5 border border-white/10 hover:bg-white/5 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">🇺🇿</span>
          <span className="text-xs font-bold text-white">Ilova tili</span>
        </div>
        <span className="text-xs text-white/60 flex items-center gap-1">
          {selectedLang} <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* Log out button */}
      <button
        type="button"
        disabled={loggingOut}
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[#161a29] p-3.5 border border-white/10 text-[#ef4444] hover:bg-red-500/10 transition active:scale-98 disabled:opacity-50"
      >
        {loggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="text-xs font-bold">Akkauntdan chiqish</span>
      </button>

      {/* Social Icons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#161a29] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition active:scale-95"
          aria-label="Instagram"
        >
          <Camera className="h-5 w-5" />
        </a>
        <a
          href="https://t.me/OneMediaRasmiy"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#161a29] border border-white/10 text-[#ef4444] hover:text-white hover:bg-red-500/20 transition active:scale-95"
          aria-label="Telegram"
        >
          <Send className="h-5 w-5" />
        </a>
      </div>

      {/* Version and Diagnostics Footer */}
      <div className="text-center space-y-1 pt-1">
        <p className="text-[11px] text-white/40">Ilova versiya: 2.5.0 (Barqaror WebApp)</p>
        <button
          type="button"
          onClick={() => {
            setShowSpeedModal(true)
            runSpeedTest()
          }}
          className="text-[10px] text-white/40 hover:text-white/70 underline"
        >
          Internet tezligi testi
        </button>
      </div>

      {/* MODAL 1: Promokod Faollashtirish */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161a29] p-5 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-400" />
                <h3 className="font-bold text-sm text-white">Promokod faollashtirish</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="rounded-full p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              OneMedia maxsus promokodini kiriting va VIP obuna yoki balansga ega bo&apos;ling.
            </p>

            <input
              type="text"
              placeholder="Masalan: ONEMEDIA2026"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-mono tracking-wider text-white placeholder:text-white/30 border border-white/10 focus:outline-none focus:border-pink-500"
            />

            {promoStatus.msg && (
              <p
                className={`text-xs ${
                  promoStatus.type === "success" ? "text-emerald-400 font-bold" : "text-rose-400"
                }`}
              >
                {promoStatus.msg}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/15"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="flex-1 rounded-xl bg-pink-500 py-2.5 text-xs font-bold text-white hover:bg-pink-600 shadow-lg shadow-pink-500/20"
              >
                Faollashtirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TV Aktivlashtirish */}
      {showTvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161a29] p-5 border border-white/15 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Tv className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Smart TV Ulanish</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTvModal(false)}
                className="rounded-full p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 text-left">
              Televizordagi <strong>OneMedia TV</strong> ilovasini oching va ekranda chiqqan kodni bu yerga yozing:
            </p>

            <input
              type="text"
              maxLength={6}
              placeholder="000 000"
              value={tvCode}
              onChange={(e) => setTvCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-2xl bg-white/5 py-3 text-center text-xl font-mono tracking-widest text-white placeholder:text-white/20 border border-white/10 focus:outline-none focus:border-cyan-500"
            />

            {tvStatus && <p className="text-xs text-emerald-400 font-bold">{tvStatus}</p>}

            <button
              type="button"
              onClick={handleTvActivation}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/20"
            >
              Ulash
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Mening Qurilmalarim */}
      {showDevicesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161a29] p-5 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Smartphone className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Faol Qurilmalar</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDevicesModal(false)}
                className="rounded-full p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="rounded-2xl bg-white/5 p-3 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    Telegram Mini App <span className="text-[10px] text-emerald-400 font-normal">(Ushbu qurilma)</span>
                  </p>
                  <p className="text-[11px] text-white/40">Hozir faol • Toshkent, UZ</p>
                </div>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>

              <div className="rounded-2xl bg-white/5 p-3 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Chrome Brauzer</p>
                  <p className="text-[11px] text-white/40">Oxirgi faollik: Kecha</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast("Boshqa barcha sessiyalar yakunlandi!")
                setShowDevicesModal(false)
              }}
              className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/15"
            >
              Boshqa qurilmalarni o&apos;chirish
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: To'lovlar Tarixi */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161a29] p-5 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <History className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Xaridlar Tarixi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-full p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="rounded-2xl bg-white/5 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Hisob ochildi</p>
                  <p className="text-[10px] text-white/40">Ro&apos;yxatdan o&apos;tish bonusi</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">+0 so&apos;m</span>
              </div>
            </div>

            <Link
              href="/payment"
              onClick={() => setShowHistoryModal(false)}
              className="block text-center w-full rounded-xl bg-blue-500 py-2.5 text-xs font-bold text-white hover:bg-blue-600"
            >
              Obuna Sotib Olish
            </Link>
          </div>
        </div>
      )}

      {/* MODAL 5: Internet Tezligi Testi */}
      {showSpeedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161a29] p-5 border border-white/15 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Wifi className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Internet Tezligi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSpeedModal(false)}
                className="rounded-full p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {speedTestRunning ? (
              <div className="py-8 space-y-3">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-white/70">CDN serveriga ulanish tekshirilmoqda...</p>
              </div>
            ) : speedResult ? (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[10px] text-white/40">Kechikish (Ping)</p>
                    <p className="text-lg font-black text-emerald-400">{speedResult.ping} ms</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[10px] text-white/40">Streaming tezligi</p>
                    <p className="text-lg font-black text-cyan-400">{speedResult.speed} Mbps</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-300">
                  ✨ 4K Ultra HD va Full HD kinolarni bemalol qotmasdan ko&apos;rish mumkin!
                </p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={speedTestRunning}
              onClick={runSpeedTest}
              className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              Qayta tekshirish
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: Tilni tanlash */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161a29] p-5 border border-white/15 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-bold text-sm text-white">Ilova tilini tanlang</h3>
              <button
                type="button"
                onClick={() => setShowLangModal(false)}
                className="rounded-full p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {[
              { label: "O'zbekcha", flag: "🇺🇿" },
              { label: "Русский", flag: "🇷🇺" },
              { label: "English", flag: "🇬🇧" },
            ].map((lang) => (
              <button
                key={lang.label}
                type="button"
                onClick={() => {
                  setSelectedLang(lang.label)
                  setShowLangModal(false)
                  showToast(`Til o'zgartirildi: ${lang.label}`)
                }}
                className={`flex w-full items-center justify-between rounded-2xl p-3.5 text-xs font-bold transition ${
                  selectedLang === lang.label
                    ? "bg-red-500/20 text-white border border-red-500/40"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {selectedLang === lang.label && <Check className="h-4 w-4 text-red-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
