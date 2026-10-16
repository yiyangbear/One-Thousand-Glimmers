import { useEffect, useRef, useState } from 'react'

const FADE_IN_MS = 2_000
const FADE_OUT_MS = 1_500
const AUDIO_SOURCE = `${import.meta.env.BASE_URL}audio/one-thousand-glimmers.mp3`

type PlaybackState = 'off' | 'fading-in' | 'on' | 'fading-out' | 'error'

function labelForState(state: PlaybackState) {
  if (state === 'error') return '音乐无法加载，点击重试'
  if (state === 'off' || state === 'fading-out') return '开启背景音乐'
  return '关闭背景音乐'
}

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number | null>(null)
  const operationRef = useRef(0)
  const wantsPlaybackRef = useRef(false)
  const [playbackState, setPlaybackState] = useState<PlaybackState>('off')

  const cancelFade = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const fadeVolume = (
    audio: HTMLAudioElement,
    target: number,
    duration: number,
    operation: number,
    onComplete: () => void,
  ) => {
    cancelFade()
    const startVolume = audio.volume
    const startedAt = performance.now()

    const frame = (now: number) => {
      if (operation !== operationRef.current) return
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = progress * progress * (3 - 2 * progress)
      audio.volume = startVolume + (target - startVolume) * eased
      audio.dataset.volume = audio.volume.toFixed(3)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame)
        return
      }

      animationRef.current = null
      onComplete()
    }

    animationRef.current = requestAnimationFrame(frame)
  }

  const startPlayback = async (audio: HTMLAudioElement, operation: number) => {
    setPlaybackState('fading-in')
    if (audio.paused) {
      audio.volume = 0
      audio.dataset.volume = '0.000'
    }

    try {
      await audio.play()
    } catch {
      if (operation !== operationRef.current || !wantsPlaybackRef.current) return
      wantsPlaybackRef.current = false
      setPlaybackState('error')
      return
    }

    if (operation !== operationRef.current || !wantsPlaybackRef.current) {
      audio.pause()
      return
    }

    fadeVolume(audio, 1, FADE_IN_MS, operation, () => setPlaybackState('on'))
  }

  const stopPlayback = (audio: HTMLAudioElement, operation: number) => {
    setPlaybackState('fading-out')
    fadeVolume(audio, 0, FADE_OUT_MS, operation, () => {
      audio.pause()
      setPlaybackState('off')
    })
  }

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    const operation = ++operationRef.current
    wantsPlaybackRef.current = !wantsPlaybackRef.current

    if (wantsPlaybackRef.current) {
      void startPlayback(audio, operation)
    } else {
      stopPlayback(audio, operation)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      operationRef.current += 1
      wantsPlaybackRef.current = false
      cancelFade()
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
    }
  }, [])

  const handleLoadError = () => {
    const audio = audioRef.current
    operationRef.current += 1
    wantsPlaybackRef.current = false
    cancelFade()
    audio?.pause()
    setPlaybackState('error')
  }

  const isPlaying = playbackState === 'fading-in' || playbackState === 'on'

  return (
    <div className="ambient-audio">
      <audio
        ref={audioRef}
        src={AUDIO_SOURCE}
        loop
        preload="none"
        onError={handleLoadError}
        data-testid="ambient-audio-element"
      />
      <button
        className="ambient-audio__toggle"
        type="button"
        aria-label={labelForState(playbackState)}
        aria-pressed={isPlaying}
        data-state={playbackState}
        onClick={togglePlayback}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 9.25v5.5h3.2l4.3 3.5V5.75l-4.3 3.5H4.5Z" />
          <path className="ambient-audio__wave ambient-audio__wave--near" d="M15 9.2c.8.7 1.2 1.65 1.2 2.8s-.4 2.1-1.2 2.8" />
          <path className="ambient-audio__wave ambient-audio__wave--far" d="M17.6 6.8c1.45 1.35 2.15 3.08 2.15 5.2s-.7 3.85-2.15 5.2" />
          <path className="ambient-audio__muted-mark" d="m15.25 9.25 4.5 5.5m0-5.5-4.5 5.5" />
        </svg>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {playbackState === 'error' ? '背景音乐加载失败，画面仍可正常观看。' : ''}
      </span>
    </div>
  )
}
