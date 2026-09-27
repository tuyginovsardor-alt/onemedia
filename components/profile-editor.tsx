"use client"

import { useState } from "react"
import { updateProfile } from "@/app/actions/profile"

export function ProfileEditor({ initial }: { initial: { bio: string; phone: string; location: string; website: string } }) {
  const [form, setForm] = useState(initial)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    await updateProfile(form)
    setSaving(false)
    setMessage("Profil saqlandi")
  }
  return <form onSubmit={save} className="space-y-4 rounded-2xl glass p-5 ring-1 ring-white/10">
    <h2 className="font-display text-xl font-bold text-white">Profil ma’lumotlari</h2>
    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="O‘zingiz haqingizda" maxLength={500} className="min-h-24 w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />
    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />
    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Manzil" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />
    <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website" className="w-full rounded-xl bg-white/10 px-4 py-3 text-white outline-none" />
    <div className="flex items-center justify-between gap-3"><button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving ? "Saqlanmoqda..." : "Saqlash"}</button>{message && <span className="text-sm text-emerald-400">{message}</span>}</div>
  </form>
}
