import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth-form"
import { auth } from "@/lib/auth"

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/profile")

  return <main className="mx-auto max-w-7xl px-4 py-20"><h1 className="text-center font-display text-3xl font-bold text-white">Yangi hisob yaratish</h1><AuthForm mode="sign-up" /><p className="mt-5 text-center text-sm text-muted-foreground">Hisobingiz bormi? <Link className="text-primary" href="/sign-in">Kirish</Link></p></main>
}
