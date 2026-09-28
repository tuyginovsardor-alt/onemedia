"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { authClient } from "@/lib/auth-client"
import { TelegramAuthButton } from "@/components/telegram-auth-button"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === "sign-up"

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSignUp && !accepted) {
      setError("Maxfiylik siyosatiga rozilik bildirishingiz lozim.")
      return
    }
    setError("")
    setLoading(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(
          isSignUp
            ? "Ro'yxatdan o'tishda xatolik yuz berdi. Bu email allaqachon mavjud bo'lishi mumkin."
            : "Email yoki parol noto'g'ri kiritildi. Qayta urinib ko'ring."
        )
        setLoading(false)
        return
      }

      // Sync custom session cookie for email login
      await fetch("/api/auth/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `email_${Date.now()}`,
          first_name: name || email.split("@")[0],
          username: email.split("@")[0],
        }),
      }).catch(() => {})

      setLoading(false)
      router.push("/profile")
      router.refresh()
    } catch {
      setLoading(false)
      setError("Kutilmagan xatolik yuz berdi")
    }
  }

  return (
    <div className="relative mx-auto mt-6 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10 space-y-6">
      {/* Decorative ambient background glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

      {/* 1. Telegram Fast Login */}
      <div className="space-y-2">
        <TelegramAuthButton />
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <span className="bg-[#0b1020] px-3.5 text-[10px] font-black tracking-widest text-white/40 uppercase">
          YOKI EMAIL BILAN
        </span>
        <span className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* 2. Email Form */}
      <form onSubmit={submit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-white/70 block ml-1">To&apos;liq ismingiz:</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sardor Tuyginov"
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-white/70 block ml-1">Email manzil:</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-white/40" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ismingiz@gmail.com"
              className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-white/70 block ml-1">Parol:</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-white/40" />
            <input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
              className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 text-white/40 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <label className="flex items-start gap-2.5 pt-1 text-xs text-white/70 cursor-pointer select-none">
            <input
              required
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400 cursor-pointer"
            />
            <span>
              <Link href="/privacy" target="_blank" className="text-cyan-400 font-bold hover:underline">
                Maxfiylik siyosati
              </Link>{" "}
              va xizmat ko&apos;rsatish shartlariga roziman.
            </span>
          </label>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 font-medium">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg shadow-cyan-400/25 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <span>{loading ? "Jarayon ketmoqda..." : isSignUp ? "Ro'yxatdan o'tish" : "Tizimga kirish"}</span>
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}
