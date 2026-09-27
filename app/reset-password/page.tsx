import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-20 text-white">
      <div className="text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">OneMedia Xavfsizlik</p>
        <h1 className="font-display text-3xl font-bold text-white">Yangi Parol O&apos;rnatish</h1>
        <p className="mx-auto max-w-md text-sm text-white/60">
          Tasdiqlash kodi va yangi parolingizni kiriting.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-8 text-center text-xs text-white/50">
        <Link className="text-cyan-400 hover:underline" href="/sign-in">
          ← Kirish sahifasiga qaytish
        </Link>
      </p>
    </main>
  )
}
