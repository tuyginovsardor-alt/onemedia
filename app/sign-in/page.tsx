import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth-form"
import { auth } from "@/lib/auth"

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/profile")

  return <main className="mx-auto max-w-7xl px-4 py-20"><h1 className="text-center font-display text-3xl font-bold text-white">Hisobga kirish</h1><AuthForm mode="sign-in" /><p className="mt-4 text-center text-sm"><Link className="text-primary" href="/forgot-password">Parolni unutdingizmi?</Link></p><p className="mt-5 text-center text-sm text-muted-foreground">Hisobingiz yo‘qmi? <Link className="text-primary" href="/sign-up">Ro‘yxatdan o‘ting</Link></p></main>
}
