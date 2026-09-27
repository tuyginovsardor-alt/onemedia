import Link from "next/link"
import { Send } from 'lucide-react'
import { Logo } from "@/components/logo"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 8.5a3 3 0 0 0-2.1-2.1C18 6 12 6 12 6s-6 0-7.9.4A3 3 0 0 0 2 8.5 31 31 0 0 0 1.7 12 31 31 0 0 0 2 15.5a3 3 0 0 0 2.1 2.1C6 18 12 18 12 18s6 0 7.9-.4a3 3 0 0 0 2.1-2.1c.2-1.2.3-2.3.3-3.5s-.1-2.3-.3-3.5Z" />
      <path d="m10 15 5-3-5-3v6Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              O'zbekistondagi birinchi rasmiy kino portali. Filmlar, seriallar va multfilmlarni 4K
              sifatda tomosha qiling.
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/OneMediaHdBot"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full glass ring-1 ring-white/10 text-white transition-colors hover:bg-primary hover:ring-primary"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full glass ring-1 ring-white/10 text-white transition-colors hover:bg-primary hover:ring-primary"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full glass ring-1 ring-white/10 text-white transition-colors hover:bg-primary hover:ring-primary"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterCol
            title="Portal"
            links={[
              { label: "Bosh sahifa", href: "/" },
              { label: "Katalog", href: "/catalog" },
              { label: "AI Qidiruv", href: "/search" },
              { label: "Shorts", href: "/shorts" },
            ]}
          />
          <FooterCol
            title="Kompaniya"
            links={[
              { label: "Biz haqimizda", href: "#" },
              { label: "Litsenziya", href: "#" },
              { label: "Maxfiylik siyosati", href: "#" },
              { label: "Foydalanish shartlari", href: "#" },
            ]}
          />
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white">Aloqa</h4>
            <p className="text-sm text-muted-foreground">
              Telegram bot orqali bog'laning:
            </p>
            <a
              href="https://t.me/OneMediaHdBot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
              @OneMediaHdBot
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} OneMedia.uz — Barcha huquqlar himoyalangan.</p>
          <p>Made in Uzbekistan 🇺🇿</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-white">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
