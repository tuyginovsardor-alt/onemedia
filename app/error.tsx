"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App Error caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-5 rounded-3xl border border-white/10 bg-[#121524] p-8 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-[#ef4444] border border-red-500/30">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">
            Sahifani yuklashda xatolik
          </h2>
          <p className="text-xs text-white/60">
            Internet aloqasi yoki vaqtinchalik server yangilanishi sababli sahifa yuklanmadi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#ef4444] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/30 hover:bg-[#dc2626] transition active:scale-95"
          >
            <RefreshCw className="h-4 w-4" /> Qayta urinish
          </button>
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white hover:bg-white/10 transition"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  )
}
