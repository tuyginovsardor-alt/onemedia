"use client"

import { useState, useEffect, useRef } from "react"
import {
  Tv,
  Film,
  Sparkles,
  Plus,
  CheckCircle,
  Video,
  ListPlus,
  Wand2,
  Layers,
  Send,
  Loader2,
  Trash2,
  ExternalLink,
  Mic,
  Calendar,
  Clock,
} from 'lucide-react'
import { parseTelegramMediaPost } from "@/lib/media-parser"
import { createMediaAction } from "@/app/actions/admin-management"

const POPULAR_GENRES = [
  "Anime",
  "Jangari",
  "Fantastika",
  "Sarguzasht",
  "Komediya",
  "Drama",
  "Triller",
  "Multfilm",
  "Tarixiy",
  "Qo'rqinchli",
  "Melodrama",
  "Isekai",
  "Shounen",
]

const DUBBING_STUDIOS = [
  "AnimeDub",
  "FanDub Uz",
  "AsilMedia Dublyaj",
  "SilkRoad Anime",
  "UzAnime Group",
  "Tarjima Kinolar",
]

type EpisodeItem = {
  episodeNumber: number
  title: string
  fileId: string
  duration: string
}

export function SmartMediaAdder() {
  const [mode, setMode] = useState<"movie" | "anime">("movie")
  const [pasteText, setPasteText] = useState("")
  const [showAutoParser, setShowAutoParser] = useState(false)

  // Main Form fields
  const [title, setTitle] = useState("")
  const [year, setYear] = useState(2025)
  const [rating, setRating] = useState(8.8)
  const [quality, setQuality] = useState<"4K" | "FHD" | "HD">("4K")
  const [duration, setDuration] = useState("1h 50m")
  const [genres, setGenres] = useState("Jangari, Fantastika")
  const [synopsis, setSynopsis] = useState("")
  const [telegramFileId, setTelegramFileId] = useState("")
  const [posterUrl, setPosterUrl] = useState("")

  // Anime Advanced fields
  const [season, setSeason] = useState(1)
  const [animeStatus, setAnimeStatus] = useState<"ongoing" | "completed">("ongoing")
  const [dubbingStudio, setDubbingStudio] = useState("AnimeDub")
  const [totalEpisodes, setTotalEpisodes] = useState(12)
  const [episodesList, setEpisodesList] = useState<EpisodeItem[]>([
    { episodeNumber: 1, title: "1-qism", fileId: "", duration: "24 daq" },
  ])
  const [bulkFileIds, setBulkFileIds] = useState("")

  // Telegram Live Sync states
  const [syncSessionId, setSyncSessionId] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "waiting" | "received">("idle")
  const [syncMessage, setSyncMessage] = useState("")
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  // Start Telegram Bot Live Sync session
  async function handleStartBotSync() {
    setSyncStatus("waiting")
    setSyncMessage("Telegram bot bilan bog'lanish yaratilmoqda...")

    try {
      const res = await fetch("/api/telegram/sync-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()

      if (data.sessionId) {
        setSyncSessionId(data.sessionId)
        setSyncMessage(`🟡 Botingizga video yoki postni tashlang... (Kutilmoqda)`)

        // Open Telegram bot URL
        const botUrl = data.botUrl || `https://t.me/onemediahd_bot?start=upload_${data.sessionId}`
        try {
          const tg = (window as any).Telegram?.WebApp
          if (tg?.openTelegramLink) {
            tg.openTelegramLink(botUrl)
          } else {
            window.open(botUrl, "_blank")
          }
        } catch {
          window.open(botUrl, "_blank")
        }

        // Start polling
        startPollingSync(data.sessionId)
      }
    } catch (err) {
      setSyncStatus("idle")
      setSyncMessage("Xatolik: Botga ulanib bo'lmadi")
    }
  }

  function startPollingSync(sessionId: string) {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/sync-upload?session=${sessionId}`)
        const json = await res.json()

        if (json.status === "received" && json.data) {
          const d = json.data
          setSyncStatus("received")
          setSyncMessage("🎉 Video va ma'lumotlar botdan qabul qilindi!")

          // Autofill form
          if (d.title) setTitle(d.title)
          if (d.year) setYear(d.year)
          if (d.rating) setRating(d.rating)
          if (d.quality) setQuality(d.quality)
          if (d.duration) setDuration(d.duration)
          if (d.genres && d.genres.length > 0) setGenres(d.genres.join(", "))
          if (d.synopsis) setSynopsis(d.synopsis)
          if (d.videoFileId) setTelegramFileId(d.videoFileId)
          if (d.photoFileId) setPosterUrl(d.photoFileId)
          if (d.type === "anime") {
            setMode("anime")
            if (d.totalEpisodes) setTotalEpisodes(d.totalEpisodes)
          }

          // Stop polling
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch {
        // ignore network hiccups
      }
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Auto-parse Telegram Post Text
  function handleAutoParse() {
    if (!pasteText.trim()) return
    const parsed = parseTelegramMediaPost(pasteText)
    setTitle(parsed.title)
    setYear(parsed.year)
    setRating(parsed.rating)
    setQuality(parsed.quality)
    setDuration(parsed.duration)
    setGenres(parsed.genres.join(", "))
    setSynopsis(parsed.synopsis)
    if (parsed.fileId) setTelegramFileId(parsed.fileId)
    if (parsed.type === "anime") {
      setMode("anime")
      if (parsed.totalEpisodes && parsed.totalEpisodes > 1) {
        setTotalEpisodes(parsed.totalEpisodes)
      }
    }
    setShowAutoParser(false)
  }

  function toggleGenre(genre: string) {
    const list = genres.split(",").map((g) => g.trim()).filter(Boolean)
    if (list.includes(genre)) {
      setGenres(list.filter((g) => g !== genre).join(", "))
    } else {
      setGenres([...list, genre].join(", "))
    }
  }

  // Add individual episode
  function addEpisode() {
    const nextNum = episodesList.length + 1
    setEpisodesList([
      ...episodesList,
      { episodeNumber: nextNum, title: `${nextNum}-qism`, fileId: "", duration: "24 daq" },
    ])
    setTotalEpisodes(nextNum)
  }

  function removeEpisode(idx: number) {
    const next = episodesList.filter((_, i) => i !== idx)
    setEpisodesList(next)
    setTotalEpisodes(next.length)
  }

  function updateEpisode(idx: number, field: keyof EpisodeItem, val: any) {
    const next = [...episodesList]
    next[idx] = { ...next[idx], [field]: val }
    setEpisodesList(next)
    if (idx === 0 && field === "fileId") {
      setTelegramFileId(val)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg("")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("type", mode)
    formData.append("year", year.toString())
    formData.append("rating", rating.toString())
    formData.append("duration", duration)
    formData.append("quality", quality)
    formData.append("genres", genres)
    formData.append("synopsis", synopsis)
    formData.append("telegramFileId", telegramFileId)
    formData.append("totalEpisodes", mode === "anime" ? totalEpisodes.toString() : "1")

    // Anime specific extras
    if (mode === "anime") {
      formData.append("season", season.toString())
      formData.append("animeStatus", animeStatus)
      formData.append("dubbingStudio", dubbingStudio)
      formData.append("episodesJson", JSON.stringify(episodesList))
    }

    try {
      await createMediaAction(formData)
      setLoading(false)
      setSuccessMsg(`🎉 «${title}» muvaffaqiyatli bazaga qo'shildi!`)
      setTitle("")
      setSynopsis("")
      setTelegramFileId("")
      setBulkFileIds("")
      setSyncStatus("idle")
      setSyncMessage("")
      setTimeout(() => setSuccessMsg(""), 5000)
    } catch (err) {
      setLoading(false)
      alert((err as Error).message || "Xatolik yuz berdi")
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Special Banner: 2 Magic Helpers */}
      <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/50 to-purple-950/30 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Aqlli Yordamchi (Telegram Bot orqali to&apos;g&apos;ridan-to&apos;g&apos;ri yuklash)
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              Faylni botga tashlang — tizim avtomatik tarzda videoni, rasmni va tavsifni saytga o&apos;tkazadi!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Telegram Bot Direct Forward / Upload Trigger */}
            <button
              type="button"
              onClick={handleStartBotSync}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                syncStatus === "waiting"
                  ? "bg-amber-400 text-slate-950 animate-pulse"
                  : syncStatus === "received"
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20"
              }`}
            >
              {syncStatus === "waiting" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Botdan kutilmoqda...
                </>
              ) : syncStatus === "received" ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" /> Qabul qilindi!
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Botga yuborib yuklash
                </>
              )}
            </button>

            {/* Paste Text Parser */}
            <button
              type="button"
              onClick={() => setShowAutoParser((p) => !p)}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5 text-cyan-400" />
              {showAutoParser ? "Yashirish" : "Matndan to'ldirish"}
            </button>
          </div>
        </div>

        {/* Live Sync Status Notice */}
        {syncMessage && (
          <div
            className={`rounded-xl p-3 text-xs flex items-center justify-between gap-2 border ${
              syncStatus === "received"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-amber-400/40 bg-amber-400/10 text-amber-200"
            }`}
          >
            <span>{syncMessage}</span>
            {syncStatus === "waiting" && (
              <a
                href={syncSessionId ? `https://t.me/onemediahd_bot?start=upload_${syncSessionId}` : "https://t.me/onemediahd_bot"}
                target="_blank"
                rel="noreferrer"
                className="underline text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1"
              >
                Botni ochish <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Auto Parser Textarea Drawer */}
      {showAutoParser && (
        <div className="rounded-2xl border border-cyan-400/40 bg-slate-950 p-4 space-y-3 animate-in fade-in duration-200">
          <label className="text-xs font-bold text-cyan-300 block">
            Telegram Kanaldan nusxalangan post matnini tashlang:
          </label>
          <textarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Masalan:\n🎬 Nomi: Solo Leveling 2-mavsum\n📅 Yil: 2025\n⭐ Reyting: 9.1\n🎭 Janr: Anime, Jangari, Fantastika\n📁 File ID: BAACAgIAAxkBA...\n📝 Tavsif: Insoniyatning eng zaif ovchisi...`}
            className="w-full rounded-xl border border-white/15 bg-black/60 p-3 text-xs text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPasteText("")}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white"
            >
              Tozalash
            </button>
            <button
              type="button"
              onClick={handleAutoParse}
              className="rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 flex items-center gap-1.5 shadow-md shadow-cyan-400/20"
            >
              <Sparkles className="h-3.5 w-3.5" /> Matndan to&apos;ldirish
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector (Film vs Anime) */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("movie")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition border ${
            mode === "movie"
              ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-400/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
          }`}
        >
          <Film className="h-4 w-4" /> 🎬 Film qo&apos;shish
        </button>

        <button
          type="button"
          onClick={() => setMode("anime")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition border ${
            mode === "anime"
              ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20"
              : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
          }`}
        >
          <Tv className="h-4 w-4" /> 🎭 Anime / Serial qo&apos;shish (To&apos;liq funksiyalar)
        </button>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-white/70 block mb-1">Nomi:</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === "anime" ? "masalan: Solo Leveling 2-mavsum" : "masalan: Qasoskorlar: Intiho"}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Telegram Storage File ID (Video yoki 1-qism):
            </label>
            <input
              value={telegramFileId}
              onChange={(e) => setTelegramFileId(e.target.value)}
              placeholder="BAACAgIAAxkBAAE... (Botga tashlasangiz o'zi to'ladi)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-white/30 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-white/70 block mb-1">Yili:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">Reyting (1-10):</label>
            <input
              type="number"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">Sifat darajasi:</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="4K">4K Ultra HD</option>
              <option value="FHD">Full HD 1080p</option>
              <option value="HD">HD 720p</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              {mode === "anime" ? "Qismlar soni:" : "Davomiyligi:"}
            </label>
            {mode === "anime" ? (
              <input
                type="number"
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            ) : (
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2h 15m"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* ================= ANIME EXPANDED SECTION ================= */}
        {mode === "anime" && (
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Tv className="h-4 w-4" /> Anime Maxsus Sozlamalari
              </h4>
              <span className="text-[10px] text-white/50">Mavsumlar va Dublyaj boshqaruvi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Mavsum (Season):</label>
                <input
                  type="number"
                  min={1}
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Holati (Status):</label>
                <select
                  value={animeStatus}
                  onChange={(e) => setAnimeStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="ongoing">Davom etmoqda (Ongoing)</option>
                  <option value="completed">Tugallangan (Completed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Ovoz beruvchilar (Dublyaj):</label>
                <select
                  value={dubbingStudio}
                  onChange={(e) => setDubbingStudio(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                >
                  {DUBBING_STUDIOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Individual Episode Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-purple-200">
                  Anime qismlari ro&apos;yxati ({episodesList.length} ta):
                </label>
                <button
                  type="button"
                  onClick={addEpisode}
                  className="rounded-lg bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/30 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Qism qo&apos;shish
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {episodesList.map((ep, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 text-xs"
                  >
                    <span className="w-12 text-center font-bold text-purple-400">{ep.episodeNumber}-qism</span>
                    <input
                      value={ep.title}
                      onChange={(e) => updateEpisode(idx, "title", e.target.value)}
                      placeholder="Qism nomi"
                      className="w-28 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                    />
                    <input
                      value={ep.fileId}
                      onChange={(e) => updateEpisode(idx, "fileId", e.target.value)}
                      placeholder="Telegram File ID"
                      className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs font-mono text-cyan-300 placeholder-white/20"
                    />
                    <input
                      value={ep.duration}
                      onChange={(e) => updateEpisode(idx, "duration", e.target.value)}
                      placeholder="24 daq"
                      className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                    />
                    {episodesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEpisode(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk File ID paste alternative */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] text-white/60 block">
                Yoki barcha qismlar File ID larini bir vaqtning o&apos;zida tashlang (har qatorga bittadan):
              </label>
              <textarea
                rows={2}
                value={bulkFileIds}
                onChange={(e) => {
                  setBulkFileIds(e.target.value)
                  const lines = e.target.value.split("\n").filter((l) => l.trim().length > 10)
                  if (lines.length > 0) {
                    setTotalEpisodes(lines.length)
                    setTelegramFileId(lines[0].trim())
                    const newEps = lines.map((fid, i) => ({
                      episodeNumber: i + 1,
                      title: `${i + 1}-qism`,
                      fileId: fid.trim(),
                      duration: "24 daq",
                    }))
                    setEpisodesList(newEps)
                  }
                }}
                placeholder={`1-qism Telegram File ID\n2-qism Telegram File ID\n3-qism Telegram File ID...`}
                className="w-full rounded-xl border border-white/10 bg-black/50 p-2 text-xs font-mono text-cyan-300 placeholder-white/30 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Genres Pill Selector */}
        <div>
          <label className="text-xs text-white/70 block mb-1.5">Janrlar (bosing yoki yozing):</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {POPULAR_GENRES.map((g) => {
              const selected = genres.includes(g)
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    selected
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              )
            })}
          </div>
          <input
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Synopsis */}
        <div>
          <label className="text-xs text-white/70 block mb-1">Tavsif (Mazmuni):</label>
          <textarea
            rows={2}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Film yoki anime haqida qisqacha ma'lumot..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 transition shadow-lg ${
            mode === "anime"
              ? "bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/20"
              : "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20"
          }`}
        >
          <Plus className="h-4 w-4" />
          {loading
            ? "Bazaga qo'shilmoqda..."
            : mode === "anime"
            ? "🎭 Yangi Animeni Bazaga Saqlash"
            : "🎬 Yangi Filmni Bazaga Saqlash"}
        </button>
      </form>
    </div>
  )
}
