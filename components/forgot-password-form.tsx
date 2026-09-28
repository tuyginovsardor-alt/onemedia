"use client"

import { useState } from "react"
import Link from "next/link"
import { Send, KeyRound, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { requestPasswordResetCode, confirmPasswordReset } from "@/app/actions/auth-reset"

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "verify" | "success">("request")
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative mx-auto mt-6 w-full max-w-md">
      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 font-medium flex items-center gap-2.5 shadow-lg">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {step === "request" && (
        <form onSubmit={handleRequestCode} className="space-y-5 rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-white/80" htmlFor="forgot-identifier">
              Email manzilingiz yoki Telegram username:
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                id="forgot-identifier"
                name="identifier"
                required
                placeholder="masalan: foydalanuvchi@gmail.com yoki @sardor"
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3.5 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Telegram botimizga a&apos;zo bo&apos;lsangiz, tasdiqlash kodi to&apos;g&apos;ridan-to&apos;g&apos;ri Telegram orqali ham keladi.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-cyan-300 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/25 disabled:opacity-50"
          >
            <span>{loading ? "Kod yuborilmoqda..." : "Tasdiqlash kodini olish"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleConfirmReset} className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
          {infoMessage && (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-3.5 text-xs text-cyan-300 flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold text-white/80">
              6 xonali tasdiqlash kodi:
            </label>
            <input
              required
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-center font-mono text-xl tracking-widest text-cyan-300 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-white/80">
              Yangi parol:
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-10 py-3 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none"
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

          <div>
            <label className="mb-1 block text-xs font-bold text-white/80">
              Yangi parolni takrorlang:
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Parolni qayta kiriting"
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-cyan-300 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/25 disabled:opacity-50"
          >
            {loading ? "Saqlanmoqda..." : "Parolni yangilash va Saqlash"}
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="w-full text-center text-xs text-white/50 hover:text-white font-medium"
          >
            ← Boshqa email kiritish
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-950/90 p-8 text-center space-y-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="text-xl font-black text-white">Parol muvaffaqiyatli yangilandi!</h2>
          <p className="text-xs text-white/70 leading-relaxed">
            Yangi parolingiz tizimda saqlandi. Endi yangi parol bilan hisobga kirishingiz mumkin.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-emerald-300 transition shadow-lg shadow-emerald-400/25"
          >
            Kirish sahifasiga o&apos;tish <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
