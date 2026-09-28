"use client"

import { useState } from "react"
import { submitPayment } from "@/app/actions/payment"

export function ManualPaymentForm() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return setMessage("Chek rasmini tanlang")
    setBusy(true); setMessage("")
    try {
      const upload = new FormData(); upload.append("file", file)
      const response = await fetch("/api/payment/upload", { method: "POST", body: upload })
      const uploaded = await response.json()
      if (!response.ok) throw new Error(uploaded.error || "Upload xatosi")
      const form = new FormData(event.currentTarget)
      form.append("receiptPathname", uploaded.pathname)
      await submitPayment(form)
      setMessage("Arizangiz yuborildi. Admin tekshirganidan keyin obuna faollashadi.")
      event.currentTarget.reset(); setFile(null)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Xatolik yuz berdi") }
    finally { setBusy(false) }
  }

  return <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[.04] p-4">
    <div>
      <label className="mb-2 block text-sm text-white/70">Tarifni tanlang</label>
      <select name="plan" className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white">
        <option value="plan-1d">⚡ 1 kunlik VIP Pass — 3 000 UZS</option>
        <option value="plan-1w">🚀 1 haftalik VIP Express — 9 000 UZS</option>
        <option value="plan-1m">⭐ 1 oylik VIP Premium — 25 000 UZS (Tavsiya etiladi)</option>
        <option value="plan-1y">👑 1 yillik MAX Cheksiz — 120 000 UZS</option>
      </select>
    </div>
    <div><label className="mb-2 block text-sm text-white/70">Tranzaksiya ID</label><input required name="transactionId" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white" placeholder="To‘lovdan keyingi ID" /></div>
    <div><label className="mb-2 block text-sm text-white/70">To‘lov cheki</label><input required type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-black" /></div>
    <button disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Yuborilmoqda..." : "Tasdiqlash uchun yuborish"}</button>
    {message && <p className="text-sm text-white/70" role="status">{message}</p>}
  </form>
}
