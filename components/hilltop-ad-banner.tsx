"use client"

import { useEffect, useRef } from "react"

const SCRIPT_ZONE_1 = "//prizefamily.com/boX_VJs/d.Gsl-0EYHWXcF/Ee/mM9/uDZeUQl/kZPnTlcZ0NN/jMccz/OeTmMQtwNZzxQJ2BNFzfMC5PNkwn"
const SCRIPT_ZONE_2 = "//prizefamily.com/bBXkVOs.dYGklo0fY/WAcR/KehmF9puYZ/UplxkvPfTNcA0/NXjscL1HNaDYE/tbN/zvQ_2NNvzLUC0vNcQK"

export function HilltopAdBanner({
  className = "",
  variant = "zone1",
}: {
  className?: string
  variant?: "zone1" | "zone2"
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector("script")) return

    try {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.referrerPolicy = "no-referrer-when-downgrade"
      script.src = variant === "zone2" ? SCRIPT_ZONE_2 : SCRIPT_ZONE_1

      containerRef.current.appendChild(script)
    } catch (e) {
      console.error("HilltopAds script loading error:", e)
    }
  }, [variant])

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

export function HilltopAdBannerSecondary({ className = "" }: { className?: string }) {
  return <HilltopAdBanner className={className} variant="zone2" />
}
