"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { TelegramAuthButton } from "@/components/telegram-auth-button"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === "sign-up"

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSignUp && !accepted) {
      setError("Maxfiylik shartlarini qabul qiling.")
      return
    }
    setError("")
    setLoading(true)
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) {
      setError("Ma’lumotlar noto‘g‘ri yoki bu email allaqachon ro‘yxatdan o‘tgan.")
      return
    }
    router.push("/profile")
    router.refresh()
  }

  return (
    <div className="mx-auto mt-8 max-w-md space-y-5 rounded-2xl glass p-6 border border-white/10 shadow-2xl">
      {/* 1-Click Telegram Auth */}
      <div>
        <TelegramAuthButton />
      </div>

      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-white/10" />
        <span className="bg-[#0b1020] px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">
          YOKI EMAIL BILAN
        </span>
        <span className="h-px w-full bg-white/10" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {isSignUp && (
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="To'liq ismingiz"
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-cyan-400"
          />
        )}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email manzil"
          className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-cyan-400"
        />
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol"
          className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-cyan-400"
        />

        {isSignUp && (
          <label className="flex items-start gap-2 text-xs text-white/65">
            <input
              required
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-white/10 accent-cyan-400"
            />
            <span>
              <Link href="/privacy" target="_blank" className="text-cyan-400 underline">
                Maxfiylik siyosati
              </Link>
              ni o‘qidim va qabul qilaman.
            </span>
          </label>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-cyan-400 py-3 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-cyan-300 active:scale-95 transition shadow-lg shadow-cyan-400/20 disabled:opacity-60"
        >
          {loading ? "Kutilmoqda..." : isSignUp ? "Ro‘yxatdan o‘tish" : "Kirish"}
        </button>
      </form>
    </div>
  )
}
