"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === "sign-up"

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSignUp && !accepted) { setError("Maxfiylik shartlarini qabul qiling."); return }
    setError(""); setLoading(true)
    const result = isSignUp ? await authClient.signUp.email({ name, email, password }) : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) { setError("Ma’lumotlar noto‘g‘ri yoki bu email allaqachon ro‘yxatdan o‘tgan."); return }
    router.push("/profile"); router.refresh()
  }

  return <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl glass p-6">{isSignUp && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />}<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" /><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />{isSignUp && <label className="flex items-start gap-2 text-sm text-white/65"><input required type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" /> <span><Link href="/privacy" target="_blank" className="text-primary underline">Maxfiylik siyosati</Link>ni o‘qidim va qabul qilaman.</span></label>}{error && <p className="text-sm text-red-400">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Kutilmoqda..." : isSignUp ? "Ro‘yxatdan o‘tish" : "Kirish"}</button></form>
}
