"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  CheckCircle,
  ShieldAlert,
  Unlock,
  Crown,
  Eye,
  Send,
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { HilltopAdBanner } from "@/components/hilltop-ad-banner"

type VideoPlayerProps = {
  poster?: string
  title: string
  mediaId?: string
  videoUrl?: string
  episodes?: { id: string; episodeNumber: number; title: string; duration: string }[]
}

export function VideoPlayer({ poster, title, mediaId = "default-video", videoUrl, episodes }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [quality, setQuality] = useState("4K")
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [savedResumeTime, setSavedResumeTime] = useState<number | null>(null)
  const [showResumeBanner, setShowResumeBanner] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 1 Kino = 1 Reklama Ad Gate state
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [adCountdown, setAdCountdown] = useState(5)
  const [canUnlock, setCanUnlock] = useState(false)

  // Stream source URL: uses dynamic proxy that handles Range and Telegram refresh
  const streamSrc = videoUrl || `/api/stream/telegram?media_id=${mediaId}&ep=${currentEpisode}`

  // Check unlock status on load and episode change
  useEffect(() => {
    try {
      const isVip = localStorage.getItem("onemedia_vip") === "true"
      const unl = localStorage.getItem(`onemedia_unlocked_${mediaId}_ep${currentEpisode}`) === "true"
      if (isVip || unl) {
        setIsUnlocked(true)
      } else {
        setIsUnlocked(false)
      }
    } catch {
      setIsUnlocked(false)
    }
  }, [mediaId, currentEpisode])

  // Countdown timer for ad watch
  useEffect(() => {
    if (!showAdModal) return
    if (adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanUnlock(true)
    }
  }, [showAdModal, adCountdown])

  const handleUnlockAndPlay = () => {
    try {
      localStorage.setItem(`onemedia_unlocked_${mediaId}_ep${currentEpisode}`, "true")
    } catch {
      // ignore
    }
    setHasStarted(true)
    setIsUnlocked(true)
    setShowAdModal(false)
    if (videoRef.current) {
      videoRef.current.play().catch(() => null)
      setPlaying(true)
      setShowResumeBanner(false)
    }
  }

  // 1. Check for saved resume position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`onemedia_pos_${mediaId}_ep${currentEpisode}`)
      if (saved) {
        const time = parseFloat(saved)
        if (time > 15) {
          setSavedResumeTime(time)
          setShowResumeBanner(true)
        }
      }
    } catch {
      // ignore
    }
  }, [mediaId, currentEpisode])

  // 2. Periodic save of current playback position
  useEffect(() => {
    if (!playing || currentTime < 5) return
    const timer = setInterval(() => {
      try {
        localStorage.setItem(`onemedia_pos_${mediaId}_ep${currentEpisode}`, currentTime.toString())
      } catch {
        // ignore
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [playing, currentTime, mediaId, currentEpisode])

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00"
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    setHasStarted(true)
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      if (!isUnlocked) {
        setShowAdModal(true)
        setAdCountdown(5)
        setCanUnlock(false)
        return
      }
      videoRef.current.play().catch(() => null)
      setPlaying(true)
      setShowResumeBanner(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      setMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !muted
    setMuted(newMuted)
    videoRef.current.muted = newMuted
  }

  const jump = (delta: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + delta))
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => null)
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => null)
      }
      setIsFullscreen(false)
    }
  }

  const resumeAtSaved = () => {
    if (videoRef.current && savedResumeTime) {
      videoRef.current.currentTime = savedResumeTime
      videoRef.current.play().catch(() => null)
      setPlaying(true)
      setShowResumeBanner(false)
    }
  }

  const handleMouseMove = () => {
    setControlsVisible(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false)
    }, 3000)
  }

  // Handle stream error / auto-refresh reconnect
  const handleVideoError = () => {
    console.warn("[OneMedia Player] Stream reconnected from timestamp:", currentTime)
    if (videoRef.current) {
      const cur = videoRef.current.currentTime
      videoRef.current.src = streamSrc + `&t=${Date.now()}`
      videoRef.current.currentTime = cur
      videoRef.current.play().catch(() => null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Play Mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-slate-900/90 p-3 ring-1 ring-white/10 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Tomosha qilish rejimini tanlang:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://t.me/OneMediaHdBot?start=play_${mediaId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 active:scale-95 transition"
          >
            <Send className="h-3.5 w-3.5" /> 📹 Telegram Botda Ko'rish (4K)
          </a>
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> ▶️ Sayt Pleyerida
          </button>
        </div>
      </div>

      {/* Main Player Box */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 select-none shadow-2xl"
      >
        <video
          ref={videoRef}
          src={streamSrc}
          poster={poster}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration)
          }}
          onError={handleVideoError}
          onEnded={() => setPlaying(false)}
          onClick={togglePlay}
          playsInline
          className="h-full w-full object-contain cursor-pointer"
        />

        {/* Center Poster Overlay if not started */}
        {!hasStarted && !playing && currentTime === 0 && poster && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-10 cursor-pointer group flex items-center justify-center transition"
          >
            <Image src={poster} alt={title} fill className="object-cover opacity-80 group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="relative z-20 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-2xl shadow-cyan-400/50 group-hover:scale-110 transition duration-300">
              <Play className="h-10 w-10 fill-current translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Resume Banner (e.g. at minute 58:45) */}
        {showResumeBanner && savedResumeTime && (
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between rounded-xl border border-cyan-400/30 bg-slate-950/90 px-4 py-3 text-sm text-white backdrop-blur shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
              <span>
                Siz oxirgi marta <b>{formatTime(savedResumeTime)}</b> da to&apos;xtagan edingiz.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resumeAtSaved}
                className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-300"
              >
                Davom ettirish ▶
              </button>
              <button
                onClick={() => setShowResumeBanner(false)}
                className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10"
              >
                Boshidan
              </button>
            </div>
          </div>
        )}

        {/* 🎬 1 Kino = 1 Reklama Ad Unlock Modal */}
        {showAdModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-md rounded-2xl border border-cyan-400/40 bg-slate-950/95 p-5 text-center shadow-2xl space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-400 ring-1 ring-cyan-400/30">
                <Unlock className="h-6 w-6" />
              </div>

              <div>
                <span className="rounded-full bg-cyan-400/15 border border-cyan-400/30 px-3 py-1 text-[11px] font-extrabold text-cyan-300 uppercase">
                  1 Kino = 1 Reklama
                </span>
                <h3 className="mt-2 font-display text-lg font-black text-white">
                  Kinoni Bepul Ochish
                </h3>
                <p className="mt-1 text-xs text-white/70 leading-relaxed">
                  Homiy reklamani ko&apos;rish orqali <b>«{title}»</b> filmini to&apos;liq va 4K sifatda bepul tomosha qiling!
                </p>
              </div>

              {/* HilltopAd Banner in Modal */}
              <div
                onClick={() => setCanUnlock(true)}
                className="cursor-pointer rounded-xl border border-white/10 bg-black/60 p-2 overflow-hidden hover:border-cyan-400/50 transition"
              >
                <HilltopAdBanner className="my-0" />
                <p className="mt-1 text-[10px] text-cyan-300/80 underline font-medium">
                  💡 Reklama banneri ustiga bossangiz, kino darhol ochiladi
                </p>
              </div>

              {/* Status and Action Buttons */}
              <div className="space-y-2 pt-1">
                {canUnlock ? (
                  <button
                    onClick={handleUnlockAndPlay}
                    className="w-full rounded-xl bg-cyan-400 py-3 text-xs font-black text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-400/30 flex items-center justify-center gap-2 animate-bounce"
                  >
                    <Play className="h-4 w-4 fill-current" /> ▶ Kinoni Tomosha Qilish (Ochildi)
                  </button>
                ) : (
                  <button
                    onClick={handleUnlockAndPlay}
                    className="w-full rounded-xl bg-white/10 border border-white/20 py-3 text-xs font-bold text-white/80 hover:bg-white/20 flex items-center justify-center gap-2"
                  >
                    ⏳ Reklama ko&apos;rilmoqda ({adCountdown}s) • Tezroq Ochish
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                  <a
                    href="/payment"
                    target="_blank"
                    className="flex items-center gap-1 text-amber-300 hover:underline font-bold"
                  >
                    <Crown className="h-3.5 w-3.5 text-amber-400" /> VIP Obuna Olish (3,000 UZS)
                  </a>
                  <button
                    onClick={() => setShowAdModal(false)}
                    className="hover:text-white underline"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Big Play Button */}
        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-transform active:scale-95 hover:scale-105"
            aria-label="O'ynatish"
          >
            <span className="flex h-12 w-12 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/40">
              <Play className="h-6 w-6 sm:h-8 sm:w-8 fill-current ml-0.5" />
            </span>
          </button>
        )}

        {/* Quality Watermark */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <span className="rounded-md border border-cyan-400/30 bg-black/60 px-2 py-0.5 text-[10px] sm:text-xs font-extrabold text-cyan-400 backdrop-blur">
            {quality} ULTRA HD
          </span>
        </div>

        {/* Control Bar */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1.5 sm:gap-2 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 sm:p-4 transition-opacity duration-300",
            controlsVisible || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Seekbar */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-cyan-400 hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={togglePlay} className="p-1 hover:text-cyan-400 transition">
                {playing ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />}
              </button>
              <button onClick={() => jump(-10)} title="-10 soniya" className="p-1 hover:text-cyan-400 transition hidden xs:block">
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button onClick={() => jump(10)} title="+10 soniya" className="p-1 hover:text-cyan-400 transition hidden xs:block">
                <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="p-1 hover:text-cyan-400 transition">
                  {muted || volume === 0 ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-14 sm:w-16 h-1 cursor-pointer appearance-none rounded-full bg-white/30 accent-cyan-400 hidden sm:block"
                />
              </div>

              {/* Timestamp */}
              <span className="text-[11px] sm:text-xs font-semibold text-white/90 font-mono">
                {formatTime(currentTime)} <span className="text-white/40">/ {formatTime(duration)}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Speed Selector */}
              <button
                onClick={() => {
                  const nextSpeed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 2 : 1
                  setSpeed(nextSpeed)
                  if (videoRef.current) videoRef.current.playbackRate = nextSpeed
                }}
                className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-400"
              >
                {speed}x
              </button>

              {/* Quality Switcher */}
              <button
                onClick={() => setQuality((q) => (q === "4K" ? "1080p" : q === "1080p" ? "720p" : "4K"))}
                className="rounded bg-cyan-400/20 border border-cyan-400/40 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-cyan-300"
              >
                {quality}
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-1 hover:text-cyan-400 transition">
                {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Anime / Series Episodes Selector */}
      {episodes && episodes.length > 1 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">Qismlar ro&apos;yxati ({episodes.length} ta qism)</p>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {episodes.map((ep) => {
              const active = currentEpisode === ep.episodeNumber
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setCurrentEpisode(ep.episodeNumber)
                    setCurrentTime(0)
                    setPlaying(true)
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 font-bold"
                      : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {active && <CheckCircle className="h-3.5 w-3.5 fill-current" />}
                  <span>{ep.episodeNumber}-qism</span>
                  <span className="text-[10px] opacity-60">({ep.duration})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
