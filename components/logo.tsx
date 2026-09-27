import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-white/15 shadow-[0_0_24px_rgba(255,255,255,0.12)]">
        <Image
          src="/images/onemedia-logo.jpg"
          alt="OneMedia logotipi"
          width={1600}
          height={1600}
          className="absolute left-1/2 top-1/2 h-[96px] w-[96px] max-w-none -translate-x-[calc(50%-4px)] -translate-y-1/2 object-cover"
          priority
        />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        One<span className="text-gradient">Media</span>
      </span>
    </span>
  )
}
