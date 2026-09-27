"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    const result = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
    setLoading(false)
    setMessage(result.error ? "So‘rovni yuborib bo‘lmadi. Email manzilini tekshiring." : "Agar bu email ro‘yxatdan o‘tgan bo‘lsa, tiklash havolasi yuboriladi.")
  }

  return <form onSubmit={submit} className="mx-auto mt-8 max-w-md space-y-4 rounded-2xl glass p-6"><label className="block text-sm text-white/70" htmlFor="forgot-email">Email manzil</label><input id="forgot-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />{message && <p className="text-sm text-white/70">{message}</p>}<button disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Yuborilmoqda..." : "Tiklash havolasini yuborish"}</button></form>
}
