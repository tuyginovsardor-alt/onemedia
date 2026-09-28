"use client"

import { useEffect, useRef } from "react"

export function HilltopAdBanner({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Prevent duplicate script insertion in container
    if (containerRef.current.querySelector("script")) return

    try {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.referrerPolicy = "no-referrer-when-downgrade"
      script.src = "//prizefamily.com/boX_VJs/d.Gsl-0EYHWXcF/Ee/mM9/uDZeUQl/kZPnTlcZ0NN/jMccz/OeTmMQtwNZzxQJ2BNFzfMC5PNkwn"

      containerRef.current.appendChild(script)
    } catch (e) {
      console.error("HilltopAds script loading error:", e)
    }
  }, [])

  return (
    <div className={`mx-auto my-4 flex flex-col items-center justify-center ${className}`}>
      <div className="mb-1 text-[10px] font-bold tracking-wider text-white/40 uppercase flex items-center gap-1">
        <span>📢 Homiy Reklama</span>
      </div>
      <div
        ref={containerRef}
        className="min-h-[100px] w-full max-w-[320px] sm:max-w-[468px] md:max-w-[728px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/5 text-center"
      />
    </div>
  )
}
