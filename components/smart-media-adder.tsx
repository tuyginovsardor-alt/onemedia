"use client"

import { useState } from "react"
import { Tv, Film, Sparkles, Plus, CheckCircle, Video, ListPlus, Wand2, Layers } from 'lucide-react'
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
]

export function SmartMediaAdder() {
  const [mode, setMode] = useState<"movie" | "anime">("movie")
  const [pasteText, setPasteText] = useState("")
  const [showAutoParser, setShowAutoParser] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [year, setYear] = useState(2025)
  const [rating, setRating] = useState(8.8)
  const [quality, setQuality] = useState<"4K" | "FHD" | "HD">("4K")
  const [duration, setDuration] = useState("1h 50m")
  const [genres, setGenres] = useState("Jangari, Fantastika")
  const [synopsis, setSynopsis] = useState("")
  const [telegramFileId, setTelegramFileId] = useState("")
  const [totalEpisodes, setTotalEpisodes] = useState(12)
  const [bulkFileIds, setBulkFileIds] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

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

    try {
      await createMediaAction(formData)
      setLoading(false)
      setSuccessMsg(`🎉 «${title}» muvaffaqiyatli bazaga qo'shildi!`)
      setTitle("")
      setSynopsis("")
      setTelegramFileId("")
      setBulkFileIds("")
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err) {
      setLoading(false)
      alert((err as Error).message || "Xatolik yuz berdi")
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Banner / Auto Parser Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.04] p-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-cyan-400" />
            Yordamchi Sehrgar (Telegram Post & Forward orqali qo&apos;shish)
          </h3>
          <p className="text-[11px] text-white/60 mt-0.5">
            Telegram kanaldan nusxalangan post matnini tashlang, tizim barcha ma&apos;lumotlarni avtomatik to&apos;ldiradi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAutoParser((p) => !p)}
          className="rounded-xl bg-cyan-400/20 border border-cyan-400/40 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/30 transition flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {showAutoParser ? "Yashirish" : "Matn tashlash (Auto-fill)"}
        </button>
      </div>

      {/* Auto Parser Textarea Drawer */}
      {showAutoParser && (
        <div className="rounded-2xl border border-cyan-400/40 bg-slate-950 p-4 space-y-3 animate-in fade-in duration-200">
          <label className="text-xs font-bold text-cyan-300 block">
            Telegram Post / Forward matnini tashlang:
          </label>
          <textarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Masalan:\n🎬 Nomi: Solo Leveling 2\n📅 Yil: 2025\n⭐ Reyting: 9.1\n🎭 Janr: Anime, Jangari, Fantastika\n📁 File ID: BAACAgIAAxkBA...\n📝 Tavsif: Insoniyatning eng zaif ovchisi...`}
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
          <Tv className="h-4 w-4" /> 🎭 Anime / Serial qo&apos;shish
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
              placeholder="masalan: Qasoskorlar: Intiho yoki Solo Leveling"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">Telegram Storage File ID (Video fayl):</label>
            <input
              value={telegramFileId}
              onChange={(e) => setTelegramFileId(e.target.value)}
              placeholder="BAACAgIAAxkBAAE..."
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

        {/* Anime Multiple Episodes Batch File IDs */}
        {mode === "anime" && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-3.5 space-y-2">
            <label className="text-xs font-semibold text-purple-300 block flex items-center justify-between">
              <span>🎭 Anime qismlarining Telegram File ID lari (Ommaviy yuklash):</span>
              <span className="text-[10px] text-white/50">Har bir qatorga bitta File ID</span>
            </label>
            <textarea
              rows={3}
              value={bulkFileIds}
              onChange={(e) => {
                setBulkFileIds(e.target.value)
                const lines = e.target.value.split("\n").filter((l) => l.trim().length > 10)
                if (lines.length > 0) {
                  setTotalEpisodes(lines.length)
                  setTelegramFileId(lines[0].trim())
                }
              }}
              placeholder={`1-qism File ID (masalan: BAACAg...)\n2-qism File ID (masalan: BAACAg...)\n3-qism File ID...`}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs font-mono text-cyan-300 placeholder-white/30 focus:border-purple-400 focus:outline-none"
            />
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
