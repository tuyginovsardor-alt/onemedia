import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth-form"
import { getCurrentUser } from "@/lib/user-session"
import { Film, Sparkles, ShieldCheck } from 'lucide-react'

export default async function SignInPage() {
  const reqHeaders = await headers()
  const user = await getCurrentUser(reqHeaders)
  if (user) redirect("/profile")

  return (
    <main className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial from-cyan-950/20 via-[#070913] to-[#070913]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-400/30">
          <Sparkles className="h-3.5 w-3.5" /> OneMedia 4K Stream Portal
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
          Hisobga kirish
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Cheksiz 4K kinolar va animelar olamiga xush kelibsiz
        </p>
      </div>

      <AuthForm mode="sign-in" />

      <div className="mt-6 text-center space-y-2 text-xs">
        <p>
          <Link className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline" href="/forgot-password">
            🔑 Parolni unutdingizmi?
          </Link>
        </p>
        <p className="text-white/60">
          Sizda hisob yo&apos;qmi?{" "}
          <Link className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline" href="/sign-up">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </div>
    </main>
  )
}
