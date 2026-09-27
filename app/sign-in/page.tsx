import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth-form"
import { getCurrentUser } from "@/lib/user-session"

export default async function SignInPage() {
  const reqHeaders = await headers()
  const user = await getCurrentUser(reqHeaders)
  if (user) redirect("/profile")

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center space-y-1">
        <h1 className="font-display text-3xl font-bold text-white">Hisobga kirish</h1>
        <p className="text-xs text-white/50">OneMedia 4K kino portaliga xush kelibsiz</p>
      </div>

      <AuthForm mode="sign-in" />

      <p className="mt-4 text-center text-xs text-white/60">
        <Link className="text-cyan-400 hover:underline" href="/forgot-password">
          Parolni unutdingizmi?
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-white/50">
        Hisobingiz yo‘qmi?{" "}
        <Link className="text-cyan-400 font-semibold hover:underline" href="/sign-up">
          Ro‘yxatdan o‘ting
        </Link>
      </p>
    </main>
  )
}
