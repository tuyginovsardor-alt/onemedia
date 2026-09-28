import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth-form"
import { getCurrentUser } from "@/lib/user-session"
import { Sparkles } from 'lucide-react'

export default async function SignUpPage() {
  const reqHeaders = await headers()
  const user = await getCurrentUser(reqHeaders)
  if (user) redirect("/profile")

  return (
    <main className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-radial from-purple-950/20 via-[#070913] to-[#070913]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-400/10 px-3.5 py-1 text-xs font-bold text-purple-300 border border-purple-400/30">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Yangi A&apos;zolik
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
          Ro&apos;yxatdan o&apos;tish
        </h1>
        <p className="text-xs sm:text-sm text-white/60">
          Telegram orqali 1-bosishda yoki email bilan tezkor hisob yarating
        </p>
      </div>

      <AuthForm mode="sign-up" />

      <div className="mt-6 text-center text-xs text-white/60">
        Sizda allaqachon hisob bormi?{" "}
        <Link className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline" href="/sign-in">
          Tizimga kirish
        </Link>
      </div>
    </main>
  )
}
