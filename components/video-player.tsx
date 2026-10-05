"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
  RefreshCw,
  AlertCircle,
  SkipForward,
  Server,
  Film,
} from 'lucide-react'
import { cn } from "@/lib/utils"

type Episode = {
  id: string
  episodeNumber: number
  title: string
  duration: string
  videoUrl?: string
  telegramFileId?: string
}

type VideoPlayerProps = {
  poster?: string
  title: string
  mediaId?: string
  videoUrl?: string
  currentEpisode?: number
  onEpisodeChange?: (ep: number) => void
  episodes?: Episode[]
}

function getEmbedUrl(url?: string): string | null {
  if (!url) return null
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0]
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0]
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  }
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0]
    return `https://player.vimeo.com/video/${id}?autoplay=1`
  }
  if (url.includes("/embed/")) {
    return url
  }
  return null
}

const BACKUP_SERVERS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
]

export function VideoPlayer({
  poster,
  title,
  mediaId = "default-video",
  videoUrl,
  currentEpisode = 1,
  onEpisodeChange,
  episodes,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeEp, setActiveEp] = useState(currentEpisode)
  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [serverIndex, setServerIndex] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [savedResumeTime, setSavedResumeTime] = useState<number | null>(null)
  const [showResumeBanner, setShowResumeBanner] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keep internal episode synced with prop
  useEffect(() => {
    setActiveEp(currentEpisode)
  }, [currentEpisode])

  // Find active episode data
  const currentEpData = episodes?.find((e) => e.episodeNumber === activeEp) || episodes?.[0]
  const currentEpVideoUrl = currentEpData?.videoUrl || videoUrl
  const embedUrl = getEmbedUrl(currentEpVideoUrl)

  // Compute video source
  const getStreamSource = useCallback(() => {
    if (serverIndex === 0) {
      if (currentEpVideoUrl && !embedUrl) {
        return currentEpVideoUrl
      }
      return `/api/stream/telegram?media_id=${mediaId}&ep=${activeEp}`
    }
    return BACKUP_SERVERS[(serverIndex - 1) % BACKUP_SERVERS.length]
  }, [serverIndex, currentEpVideoUrl, embedUrl, mediaId, activeEp])

  const [videoSrc, setVideoSrc] = useState(getStreamSource())

  useEffect(() => {
    setVideoSrc(getStreamSource())
    setHasError(false)
  }, [getStreamSource])

  // Check saved position
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`onemedia_pos_${mediaId}_ep${activeEp}`)
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
  }, [mediaId, activeEp])

  // Periodic position save
  useEffect(() => {
    if (!playing || currentTime < 5) return
    const timer = setInterval(() => {
      try {
        localStorage.setItem(`onemedia_pos_${mediaId}_ep${activeEp}`, currentTime.toString())
      } catch {
        // ignore
      }
    }, 2500)
    return () => clearInterval(timer)
  }, [playing, currentTime, mediaId, activeEp])

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
      setIsLoading(true)
      videoRef.current
        .play()
        .then(() => {
          setPlaying(true)
          setIsLoading(false)
          setShowResumeBanner(false)
        })
        .catch((err) => {
          console.warn("Autoplay blocked or stream error:", err)
          setIsLoading(false)
        })
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
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + delta)
    )
  }

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
    setShowSettings(false)
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

  const handleVideoError = () => {
    console.warn("[OneMedia Player] Stream error detected, switching fallback server...")
    setHasError(true)
    setIsLoading(false)
  }

  const switchServer = (idx: number) => {
    setServerIndex(idx)
    setHasError(false)
    setIsLoading(true)
    if (videoRef.current) {
      const target = idx === 0 ? getStreamSource() : BACKUP_SERVERS[(idx - 1) % BACKUP_SERVERS.length]
      videoRef.current.src = target
      videoRef.current.load()
      videoRef.current
        .play()
        .then(() => {
          setPlaying(true)
          setHasStarted(true)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }

  const handleNextEpisode = () => {
    if (episodes && activeEp < episodes.length) {
      const next = activeEp + 1
      setActiveEp(next)
      onEpisodeChange?.(next)
      setCurrentTime(0)
      setPlaying(false)
      setHasStarted(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick Play Mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#121524] p-3 border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="text-xs font-bold text-white">Tomosha qilish rejimi:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://t.me/OneMediaRasmiy?start=play_${mediaId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-[#ef4444] px-3.5 py-2 text-xs font-black text-white hover:bg-[#dc2626] shadow-lg shadow-red-500/20 active:scale-95 transition"
          >
            <Send className="h-3.5 w-3.5" /> 📹 Telegram Botda (4K)
          </a>
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition"
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
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              poster={poster}
              preload="metadata"
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration)
                setIsLoading(false)
              }}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => {
                setIsLoading(false)
                setPlaying(true)
                setHasError(false)
              }}
              onError={handleVideoError}
              onEnded={() => {
                setPlaying(false)
                if (episodes && activeEp < episodes.length) {
                  handleNextEpisode()
                }
              }}
              onClick={togglePlay}
              playsInline
              className="h-full w-full object-contain cursor-pointer"
            />

            {/* Center Poster Overlay with Big Play button if not started */}
            {!hasStarted && !playing && currentTime === 0 && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-10 cursor-pointer group flex items-center justify-center transition"
              >
                {poster ? (
                  <Image
                    src={poster}
                    alt={title}
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0c0e18]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative z-20 flex h-20 w-20 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-2xl shadow-red-500/50 group-hover:scale-110 transition duration-300">
                  <Play className="h-10 w-10 fill-current translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Stream Error or Offline Recovery Card */}
            {hasError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center space-y-3">
                <AlertCircle className="h-12 w-12 text-[#ef4444] animate-bounce" />
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-white">Video oqimi yuklanmadi</h4>
                  <p className="text-xs text-white/60">
                    Fayl hajmi katta bo&apos;lishi yoki server band bo&apos;lishi mumkin. Zaxira serverni tanlang yoki Telegramda oching:
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => switchServer(1)}
                    className="rounded-xl bg-[#ef4444] px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> ⚡ Zaxira Serverga O&apos;tish
                  </button>
                  <a
                    href={`https://t.me/OneMediaRasmiy?start=play_${mediaId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> 📹 Telegramda 4K Ochish
                  </a>
                </div>
              </div>
            )}

            {/* Resume Banner */}
            {showResumeBanner && savedResumeTime && (
              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between rounded-xl border border-red-500/30 bg-black/90 px-4 py-3 text-sm text-white backdrop-blur shadow-xl">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-[#ef4444] shrink-0" />
                  <span className="text-xs sm:text-sm">
                    Oxirgi marta <b>{formatTime(savedResumeTime)}</b> da to&apos;xtagan edingiz.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resumeAtSaved}
                    className="rounded-lg bg-[#ef4444] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#dc2626]"
                  >
                    Davom ettirish ▶
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResumeBanner(false)}
                    className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10"
                  >
                    Boshidan
                  </button>
                </div>
              </div>
            )}

            {/* Settings Overlay Menu */}
            {showSettings && (
              <div className="absolute right-4 bottom-16 z-30 rounded-2xl bg-[#121524]/95 p-3 border border-white/15 shadow-2xl backdrop-blur text-xs space-y-2 w-48 animate-in fade-in">
                <p className="font-bold text-white/50 text-[10px] uppercase tracking-wider">
                  Tezlik (Speed):
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeSpeed(s)}
                      className={cn(
                        "rounded-lg py-1 text-center font-bold transition",
                        speed === s
                          ? "bg-[#ef4444] text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <p className="font-bold text-white/50 text-[10px] uppercase tracking-wider pt-1">
                  Server:
                </p>
                <div className="space-y-1">
                  {["Asosiy CDN", "Zaxira CDN #1", "Zaxira CDN #2"].map((srv, idx) => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => {
                        switchServer(idx)
                        setShowSettings(false)
                      }}
                      className={cn(
                        "w-full text-left rounded-lg px-2 py-1 font-medium transition flex items-center justify-between",
                        serverIndex === idx
                          ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40"
                          : "text-white/70 hover:bg-white/5"
                      )}
                    >
                      <span>{srv}</span>
                      {serverIndex === idx && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Controls Bar */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-4 transition-opacity duration-300",
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
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="hover:text-[#ef4444] transition p-1"
                    aria-label="Play/Pause"
                  >
                    {playing ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => jump(-10)}
                    className="hover:text-[#ef4444] transition text-xs font-bold flex items-center p-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-0.5" /> 10s
                  </button>

                  <button
                    type="button"
                    onClick={() => jump(10)}
                    className="hover:text-[#ef4444] transition text-xs font-bold flex items-center p-1"
                  >
                    10s <RotateCw className="h-4 w-4 ml-0.5" />
                  </button>

                  {episodes && activeEp < episodes.length && (
                    <button
                      type="button"
                      onClick={handleNextEpisode}
                      className="hover:text-[#ef4444] transition text-xs font-bold hidden sm:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg"
                      title="Keyingi qism"
                    >
                      <SkipForward className="h-3.5 w-3.5" /> Keyingi
                    </button>
                  )}

                  <span className="text-[11px] sm:text-xs text-white/70 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Volume Slider */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hover:text-[#ef4444] transition"
                    >
                      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={handleVolume}
                      className="w-14 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#ef4444]"
                    />
                  </div>

                  {/* Settings Gear */}
                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      "p-1 hover:text-[#ef4444] transition",
                      showSettings && "text-[#ef4444]"
                    )}
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>

                  {/* Quality Badge */}
                  <span className="rounded bg-[#ef4444]/20 border border-[#ef4444]/40 px-1.5 py-0.5 text-[10px] font-black text-[#ef4444]">
                    4K UHD
                  </span>

                  {/* Fullscreen */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="hover:text-[#ef4444] transition p-1"
                    aria-label="Fullscreen"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
