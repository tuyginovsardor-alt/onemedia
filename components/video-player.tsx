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
  Send,
} from 'lucide-react'
import { cn } from "@/lib/utils"

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

  // Stream source URL
  const streamSrc = videoUrl || `/api/stream/telegram?media_id=${mediaId}&ep=${currentEpisode}`

  // Check for saved resume position on mount
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

  // Periodic save of current playback position
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
    console.warn("[OneMedia Player] Reconnecting stream:", currentTime)
    if (videoRef.current) {
      const cur = videoRef.current.currentTime
      videoRef.current.src = streamSrc + `&t=${Date.now()}`
      videoRef.current.currentTime = cur
      videoRef.current.play().catch(() => null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick Play Mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#121524] p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="text-xs font-bold text-white">Tezkor tomosha qilish:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://t.me/OneMediaRasmiy?start=play_${mediaId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-[#ef4444] px-4 py-2 text-xs font-black text-white hover:bg-[#dc2626] shadow-lg shadow-red-500/20 active:scale-95 transition"
          >
            <Send className="h-3.5 w-3.5" /> 📹 Telegramda Ijro Etish (4K)
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
        className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/10 select-none shadow-2xl"
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

        {/* Center Poster Overlay with Big Play button if not started */}
        {!hasStarted && !playing && currentTime === 0 && poster && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-10 cursor-pointer group flex items-center justify-center transition"
          >
            <Image src={poster} alt={title} fill className="object-cover opacity-80 group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="relative z-20 flex h-20 w-20 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-2xl shadow-red-500/50 group-hover:scale-110 transition duration-300">
              <Play className="h-10 w-10 fill-current translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Resume Banner */}
        {showResumeBanner && savedResumeTime && (
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between rounded-xl border border-red-500/30 bg-black/90 px-4 py-3 text-sm text-white backdrop-blur shadow-xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[#ef4444] shrink-0" />
              <span>
                Oxirgi marta <b>{formatTime(savedResumeTime)}</b> da to&apos;xtagan edingiz.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resumeAtSaved}
                className="rounded-lg bg-[#ef4444] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#dc2626]"
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

        {/* Custom Controls Bar */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300",
            controlsVisible || !playing ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Progress Seek Bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ef4444]"
          />

          <div className="flex items-center justify-between pt-2 text-white">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="hover:text-[#ef4444] transition">
                {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={() => jump(-10)} className="hover:text-[#ef4444] transition text-xs font-bold flex items-center">
                <RotateCcw className="h-4 w-4 mr-0.5" /> 10s
              </button>
              <button onClick={() => jump(10)} className="hover:text-[#ef4444] transition text-xs font-bold flex items-center">
                10s <RotateCw className="h-4 w-4 ml-0.5" />
              </button>
              <span className="text-xs text-white/70 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <button onClick={toggleMute} className="hover:text-[#ef4444] transition">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="w-16 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#ef4444]"
              />

              {/* Quality & Speed */}
              <span className="rounded bg-[#ef4444]/20 border border-[#ef4444]/40 px-1.5 py-0.5 text-[10px] font-black text-[#ef4444]">
                4K UHD
              </span>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="hover:text-[#ef4444] transition">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
