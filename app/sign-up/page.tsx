import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth-form"
import { getCurrentUser } from "@/lib/user-session"

export default async function SignUpPage() {
  const reqHeaders = await headers()
  const user = await getCurrentUser(reqHeaders)
  if (user) redirect("/profile")

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center space-y-1">
        <h1 className="font-display text-3xl font-bold text-white">Yangi hisob yaratish</h1>
        <p className="text-xs text-white/50">Telegram orqali 1 soniyada yoki email bilan ro&apos;yxatdan o&apos;ting</p>
      </div>

      <AuthForm mode="sign-up" />

      <p className="mt-5 text-center text-xs text-white/50">
        Hisobingiz bormi?{" "}
        <Link className="text-cyan-400 font-semibold hover:underline" href="/sign-in">
          Kirish
        </Link>
      </p>
    </main>
  )
}
