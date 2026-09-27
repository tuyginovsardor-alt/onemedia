"use client"

import { useState } from "react"
import { ShieldCheck, Lock, Send, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react'
import { loginAdminWithPinAction } from "@/app/actions/admin-auth-actions"

export function AdminAuthGate({ returnUrl = "/admin" }: { returnUrl?: string }) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handlePinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("returnUrl", returnUrl)

    try {
      const res = await loginAdminWithPinAction(formData)
      if (res && !res.success && res.error) {
        setError(res.error)
        setLoading(false)
      }
    } catch (err) {
      // In Next.js redirect throws, so if error is not NEXT_REDIRECT, show it
      if (!(err as Error).message?.includes("NEXT_REDIRECT")) {
        setError((err as Error).message || "Kirishda xatolik yuz berdi")
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070913] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Icon */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 shadow-xl shadow-cyan-400/10 mb-3">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">OneMedia Admin Gate</h1>
          <p className="mt-1 text-xs text-white/50">
            Tizim SHA-256 xavfsizlik protokoli va keshli sessiya bilan himoyalangan
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur shadow-2xl space-y-5">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* Option 1: Telegram Bot 1-Click Auth */}
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4 text-center space-y-2.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400">
              <Send className="h-3.5 w-3.5" /> Telegram orqali 1 bosishda kirish
            </div>
            <p className="text-[11px] text-white/60">
              Botimizda <b>/admin</b> buyrug&apos;ini yozsangiz, bot sizga SHA-256 bilan imzolangan maxsus kirish tugmasini beradi.
            </p>
            <a
              href="https://t.me/onemediahd_bot?start=admin"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20"
            >
              <Send className="h-3.5 w-3.5" /> Telegram Botda Ochish
            </a>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="h-px w-full bg-white/10" />
            <span className="bg-[#0e1222] px-3 text-[10px] uppercase font-bold text-white/40 tracking-wider">YOKI PIN PAROL</span>
            <span className="h-px w-full bg-white/10" />
          </div>

          {/* Option 2: PIN / Password Form */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1.5 flex items-center justify-between">
                <span>Master PIN yoki Parol:</span>
                <span className="text-[10px] text-cyan-400 font-mono">Standart: 7777</span>
              </label>
              <div className="relative">
                <input
                  name="pin"
                  type="password"
                  required
                  placeholder="Master PIN yoki parolni kiriting"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
                />
                <KeyRound className="absolute right-3 top-3 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                defaultChecked
                className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400"
              />
              <label htmlFor="remember" className="cursor-pointer select-none">
                Meni 30 kunga eslab qolish (Kesh saqlansin)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition border border-white/15 disabled:opacity-50"
            >
              {loading ? "Tekshirilmoqda..." : "Kirish (PIN orqali)"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-white/40">
          OneMedia Streaming Studio • Barcha huquqlar himoyalangan
        </p>
      </div>
    </div>
  )
}
