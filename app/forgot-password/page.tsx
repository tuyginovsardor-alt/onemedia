import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { KeyRound, Sparkles } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial from-cyan-950/20 via-[#070913] to-[#070913]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-400/30">
          <KeyRound className="h-3.5 w-3.5" /> Xavfsizlik & Parol Tiklash
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
          Parolni qayta tiklash
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Email manzilingiz yoki Telegram bot orqali tasdiqlash kodi yuboriladi
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-xs text-white/60">
        Parolingiz yodingizdami?{" "}
        <Link className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline" href="/sign-in">
          Kirish sahifasiga qaytish
        </Link>
      </p>
    </main>
  )
}
