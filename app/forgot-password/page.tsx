import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return <main className="mx-auto max-w-7xl px-4 py-20"><h1 className="text-center font-display text-3xl font-bold text-white">Parolni tiklash</h1><p className="mx-auto mt-3 max-w-md text-center text-sm text-white/60">Emailingizni kiriting, parolni tiklash bo‘yicha yo‘riqnoma yuboramiz.</p><ForgotPasswordForm /><p className="mt-5 text-center text-sm text-white/60"><Link className="text-primary" href="/sign-in">Kirishga qaytish</Link></p></main>
}
