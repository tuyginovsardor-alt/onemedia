"use client"

import { useState } from "react"
import Link from "next/link"
import { Send, KeyRound, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'
import { requestPasswordResetCode, confirmPasswordReset } from "@/app/actions/auth-reset"

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "verify" | "success">("request")
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  async function handleRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const res = await requestPasswordResetCode(formData)
      setLoading(false)
      if (res.success) {
        setIdentifier(res.identifier)
        setInfoMessage(res.message)
        if (res.demoCode) {
          setCode(res.demoCode)
        }
        setStep("verify")
      } else {
        setError(res.error || "Xatolik yuz berdi")
      }
    } catch (err) {
      setLoading(false)
      setError((err as Error).message || "Kutilmagan xatolik yuz berdi")
    }
  }

  async function handleConfirmReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData()
    formData.append("identifier", identifier)
    formData.append("code", code)
    formData.append("newPassword", newPassword)
    formData.append("confirmPassword", confirmPassword)

    try {
      const res = await confirmPasswordReset(formData)
      setLoading(false)
      if (res.success) {
        setStep("success")
      } else {
        setError(res.error || "Parolni o'zgartirib bo'lmadi")
      }
    } catch (err) {
      setLoading(false)
      setError((err as Error).message || "Kutilmagan xatolik yuz berdi")
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-md">
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === "request" && (
        <form onSubmit={handleRequestCode} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur shadow-2xl">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70" htmlFor="forgot-identifier">
              Email manzilingiz yoki Telegram username
            </label>
            <input
              id="forgot-identifier"
              name="identifier"
              required
              placeholder="masalan: tuyginovsardor4@gmail.com yoki @sardor"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-white/50">
            Agar Telegram botimizga a&apos;zo bo&apos;lsangiz, tasdiqlash kodi to&apos;g&apos;ridan-to&apos;g&apos;ri bot orqali ham yetkaziladi.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 disabled:opacity-50"
          >
            {loading ? "Yuborilmoqda..." : "Tasdiqlash kodini olish"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleConfirmReset} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur shadow-2xl">
          {infoMessage && (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-xs text-cyan-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">
              6 xonali tasdiqlash kodi:
            </label>
            <input
              required
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-center font-mono text-xl tracking-widest text-cyan-300 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">
              Yangi parol:
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">
              Yangi parolni takrorlang:
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolni qayta kiriting"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 disabled:opacity-50"
          >
            {loading ? "Yangilanmoqda..." : "Parolni yangilash"}
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="w-full text-center text-xs text-white/50 hover:text-white"
          >
            ← Boshqa email kiritish
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-6 text-center space-y-4 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Parol muvaffaqiyatli o&apos;zgartirildi!</h2>
          <p className="text-xs text-white/70">
            Endi yangi parolingiz yordamida tizimga bemalol kirishingiz mumkin.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            Kirish sahifasiga o&apos;tish <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
