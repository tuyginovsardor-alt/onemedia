"use client"

import { useState } from "react"
import Link from "next/link"
import { Crown, Check, ChevronLeft, CreditCard, Send, ShieldCheck } from 'lucide-react'
import type { SubscriptionPlan, PaymentCard, ManualReceipt } from "@/lib/admin-store"
import { ManualPaymentForm } from "@/components/manual-payment-form"
import { cn } from "@/lib/utils"

export function SubscriptionsView({
  plans,
  cards,
  myReceipts,
}: {
  plans: SubscriptionPlan[]
  cards: PaymentCard[]
  myReceipts: ManualReceipt[]
}) {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all")
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleOpenPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white px-4 pt-4 pb-28 max-w-lg mx-auto space-y-5">
      {/* Top Header with Back button (Screenshot photo_10) */}
      <div className="relative flex items-center justify-center py-2">
        <Link
          href="/profile"
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#161a29] border border-white/10 text-white hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-lg font-black text-white">Obunalar</h1>
      </div>

      {/* Segmented Switcher: [ Barchasi | Meniki ] (Screenshot photo_10) */}
      <div className="flex w-full items-center rounded-2xl bg-[#161a29] p-1 border border-white/10">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
            activeTab === "all" ? "bg-white text-black shadow" : "text-white/60 hover:text-white"
          )}
        >
          Barchasi
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
            activeTab === "mine" ? "bg-white text-black shadow" : "text-white/60 hover:text-white"
          )}
        >
          Meniki
        </button>
      </div>

      {/* TAB 1: BARCHASI (List of Subscription Cards - Screenshot photo_10) */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {/* PLAN 1: Max (3 oylik) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#241e12] to-[#141624] p-5 border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-black text-white">Max (3 Oylik)</h2>
                <p className="font-display text-xl font-black text-amber-300 mt-1">
                  60 000 so&apos;m <span className="text-xs font-normal text-white/60">/ 3 oyga</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Crown className="h-5 w-5 fill-current" />
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Premium kinolar, Shorts, seriallar va barcha yangi premyeralarga 3 oy to&apos;liq kirish.
            </p>

            {/* Feature Pills (Screenshot photo_10) */}
            <div className="flex flex-wrap gap-1.5">
              {["Filmlar", "Seriallar", "Multfilmlar", "Premium kontent", "Premyeralar", "4K Sifat"].map((tag) => (
                <span key={tag} className="rounded-xl bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                  {tag}
                </span>
              ))}
            </div>

            {/* Gold CTA Button */}
            <button
              onClick={() => handleOpenPlan(plans.find((p) => p.id === "plan-3m") || plans[0])}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition"
            >
              Obunani ulash
            </button>
          </div>

          {/* PLAN 2: Premium (1 oylik) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#25151b] to-[#141624] p-5 border border-red-500/30 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-black text-white">Premium (1 Oylik)</h2>
                <p className="font-display text-xl font-black text-[#ef4444] mt-1">
                  25 000 so&apos;m <span className="text-xs font-normal text-white/60">/ oyiga</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40">
                <Crown className="h-5 w-5 fill-current" />
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Premium kinolar, seriallar va barcha Standard kontentlarga bitta obuna orqali to&apos;liq kirish.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {["Filmlar", "Seriallar", "Multfilmlar", "Premium kontent", "Premyeralar"].map((tag) => (
                <span key={tag} className="rounded-xl bg-black/40 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleOpenPlan(plans.find((p) => p.id === "plan-1m") || plans[1] || plans[0])}
              className="w-full rounded-2xl bg-[#ef4444] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-500/20 hover:bg-[#dc2626] active:scale-95 transition"
            >
              Obunani ulash
            </button>
          </div>

          {/* PLAN 3: Standard (7 kunlik) */}
          <div className="relative overflow-hidden rounded-3xl bg-[#161a29] p-5 border border-white/10 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-black text-white">Standard (7 Kunlik)</h2>
                <p className="font-display text-lg font-black text-white/90 mt-1">
                  9 000 so&apos;m <span className="text-xs font-normal text-white/60">/ haftasiga</span>
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white/70 border border-white/15">
                ⚡
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              7 kun davomida istalgan film va seriallarni 4K sifatda tomosha qiling.
            </p>

            <button
              onClick={() => handleOpenPlan(plans.find((p) => p.id === "plan-7d") || plans[2] || plans[0])}
              className="w-full rounded-2xl bg-white/15 py-3 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition"
            >
              Obunani ulash
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MENIKI (User Active Subscriptions and Receipts) */}
      {activeTab === "mine" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#161a29] p-5 border border-white/10 text-center space-y-2">
            <p className="text-xs font-bold uppercase text-white/40">Hozirgi holat</p>
            <h3 className="font-display text-lg font-black text-[#ef4444]">Faol obuna mavjud emas</h3>
            <p className="text-xs text-white/60">
              Obunani faollashtirish uchun tariflardan birini tanlang.
            </p>
          </div>

          {myReceipts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-white/50 px-1">So&apos;nggi to&apos;lovlar</h3>
              {myReceipts.map((rc) => (
                <div key={rc.id} className="flex items-center justify-between rounded-2xl bg-[#161a29] p-3.5 border border-white/10 text-xs">
                  <div>
                    <p className="font-bold text-white">{rc.planName}</p>
                    <p className="text-[11px] text-white/50">{rc.amountUzs.toLocaleString()} UZS</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                    rc.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                    rc.status === "rejected" ? "bg-red-500/20 text-red-400" :
                    "bg-amber-500/20 text-amber-300"
                  )}>
                    {rc.status === "approved" ? "Tasdiqlangan" : rc.status === "rejected" ? "Rad etilgan" : "Kutilmoqda"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Instructions & Card Details Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#121524] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase text-[#ef4444]">Tanlangan tarif</p>
                <h3 className="font-display text-lg font-black text-white">{selectedPlan?.name}</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-full bg-white/10 p-2 text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Bank Cards */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-white/80">To&apos;lov kartalari (Uzcard / Humo):</p>
              <div className="grid gap-2">
                {cards.map((cd) => (
                  <div key={cd.id} className="rounded-2xl border border-white/10 bg-black/40 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-white/50">{cd.bankName}</span>
                      <p className="font-mono text-sm font-bold text-cyan-300 select-all">{cd.cardNumber}</p>
                      <p className="text-[10px] text-white/70 font-semibold">{cd.cardHolder}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cd.cardNumber.replace(/\s+/g, ""))
                        alert("Karta raqami nusxalandi!")
                      }}
                      className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                    >
                      Nusxalash
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Receipt */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-white/80">Chekni yuklang yoki botga yuboring:</p>
              <ManualPaymentForm />
            </div>

            <div className="pt-2">
              <a
                href="https://t.me/OneMediaRasmiy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#ef4444] py-3 text-xs font-black text-white hover:bg-[#dc2626] transition"
              >
                <Send className="h-4 w-4" /> Telegram Botda Chek Yuborish
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
