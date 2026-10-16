import { useEffect, useRef, useState } from 'react'

const FADE_IN_SECONDS = 2
const FADE_OUT_SECONDS = 1.5
const AUDIO_SOURCE = `${import.meta.env.BASE_URL}audio/one-thousand-glimmers.mp3`
const FADE_IN_CURVE = new Float32Array([0, 0.08, 0.28, 0.55, 0.78, 0.93, 1])
const FADE_OUT_CURVE = new Float32Array([1, 0.9, 0.7, 0.42, 0.18, 0.05, 0])

type PlaybackState = 'off' | 'loading' | 'fading-in' | 'on' | 'fading-out' | 'error'
type ContextState = 'uninitialized' | AudioContextState
type AudioMetadata = { channels: number; duration: number; sampleRate: number } | null

function labelForState(state: PlaybackState) {
  if (state === 'error') return '音乐无法加载，点击重试'
  if (state === 'loading') return '取消加载背景音乐'
  if (state === 'off' || state === 'fading-out') return '开启背景音乐'
  return '关闭背景音乐'
}

export function AmbientAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const startedAtRef = useRef(0)
  const offsetRef = useRef(0)
  const operationRef = useRef(0)
  const wantsPlaybackRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<number | null>(null)
  const stateRef = useRef<PlaybackState>('off')
  const [playbackState, setPlaybackState] = useState<PlaybackState>('off')
  const [contextState, setContextState] = useState<ContextState>('uninitialized')
  const [metadata, setMetadata] = useState<AudioMetadata>(null)

  const updatePlaybackState = (state: PlaybackState) => {
    stateRef.current = state
    setPlaybackState(state)
  }

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const stopSourceImmediately = () => {
    const source = sourceRef.current
    const gain = gainRef.current
    sourceRef.current = null
    gainRef.current = null
    try {
      source?.stop()
    } catch {
      // The source may already have stopped during teardown.
    }
    source?.disconnect()
    gain?.disconnect()
  }

  const getContext = () => {
    if (!contextRef.current) contextRef.current = new AudioContext()
    return contextRef.current
  }

  const loadBuffer = async (context: AudioContext, operation: number) => {
    if (bufferRef.current) return bufferRef.current

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const response = await fetch(AUDIO_SOURCE, { signal: controller.signal })
    if (!response.ok) throw new Error(`Audio request failed with ${response.status}`)
    const bytes = await response.arrayBuffer()
    const buffer = await context.decodeAudioData(bytes)
    if (operation !== operationRef.current) return null

    bufferRef.current = buffer
    setMetadata({
      channels: buffer.numberOfChannels,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    })
    return buffer
  }

  const holdGain = (gain: GainNode, time: number) => {
    try {
      gain.gain.cancelAndHoldAtTime(time)
    } catch {
      const value = gain.gain.value
      gain.gain.cancelScheduledValues(time)
      gain.gain.setValueAtTime(value, time)
    }
  }

  const scheduleFadeInComplete = (operation: number) => {
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      if (operation === operationRef.current && wantsPlaybackRef.current) {
        updatePlaybackState('on')
      }
    }, FADE_IN_SECONDS * 1_000)
  }

  const beginSource = (context: AudioContext, buffer: AudioBuffer, operation: number) => {
    const source = context.createBufferSource()
    const gain = context.createGain()
    const now = context.currentTime
    const offset = offsetRef.current % buffer.duration

    source.buffer = buffer
    source.loop = true
    source.connect(gain)
    gain.connect(context.destination)
    gain.gain.setValueCurveAtTime(FADE_IN_CURVE, now, FADE_IN_SECONDS)
    source.start(0, offset)

    sourceRef.current = source
    gainRef.current = gain
    startedAtRef.current = now - offset
    updatePlaybackState('fading-in')
    scheduleFadeInComplete(operation)
  }

  const resumeFadingSource = (context: AudioContext, operation: number) => {
    const gain = gainRef.current
    if (!gain || !sourceRef.current) return false
    const now = context.currentTime
    holdGain(gain, now)
    gain.gain.linearRampToValueAtTime(1, now + FADE_IN_SECONDS)
    updatePlaybackState('fading-in')
    scheduleFadeInComplete(operation)
    return true
  }

  const startPlayback = async (operation: number) => {
    updatePlaybackState('loading')
    try {
      const context = getContext()
      await context.resume()
      setContextState(context.state)
      if (operation !== operationRef.current || !wantsPlaybackRef.current) return

      if (resumeFadingSource(context, operation)) return
      const buffer = await loadBuffer(context, operation)
      if (!buffer || operation !== operationRef.current || !wantsPlaybackRef.current) return
      beginSource(context, buffer, operation)
    } catch (error) {
      if (operation !== operationRef.current || !wantsPlaybackRef.current) return
      console.warn('Unable to start the original ambient music.', error)
      wantsPlaybackRef.current = false
      await contextRef.current?.suspend()
      if (contextRef.current) setContextState(contextRef.current.state)
      updatePlaybackState('error')
    }
  }

  const finishFadeOut = async (operation: number) => {
    const context = contextRef.current
    const buffer = bufferRef.current
    if (operation !== operationRef.current || wantsPlaybackRef.current || !context) return

    if (buffer) {
      offsetRef.current = (context.currentTime - startedAtRef.current) % buffer.duration
    }
    stopSourceImmediately()
    await context.suspend()
    setContextState(context.state)
    updatePlaybackState('off')
  }

  const stopPlayback = (operation: number) => {
    clearTimer()
    abortRef.current?.abort()

    if (stateRef.current === 'loading' || !gainRef.current || !contextRef.current) {
      stopSourceImmediately()
      void contextRef.current?.suspend().then(() => {
        if (contextRef.current) setContextState(contextRef.current.state)
      })
      updatePlaybackState('off')
      return
    }

    const gain = gainRef.current
    const now = contextRef.current.currentTime
    holdGain(gain, now)
    const currentValue = gain.gain.value
    const curve = new Float32Array(FADE_OUT_CURVE.length)
    for (let index = 0; index < curve.length; index += 1) {
      curve[index] = FADE_OUT_CURVE[index] * currentValue
    }
    gain.gain.setValueCurveAtTime(curve, now, FADE_OUT_SECONDS)
    updatePlaybackState('fading-out')
    timerRef.current = window.setTimeout(() => {
      void finishFadeOut(operation)
    }, FADE_OUT_SECONDS * 1_000)
  }

  const togglePlayback = () => {
    const operation = ++operationRef.current
    wantsPlaybackRef.current = !wantsPlaybackRef.current
    if (wantsPlaybackRef.current) void startPlayback(operation)
    else stopPlayback(operation)
  }

  useEffect(() => {
    return () => {
      operationRef.current += 1
      wantsPlaybackRef.current = false
      abortRef.current?.abort()
      clearTimer()
      stopSourceImmediately()
      void contextRef.current?.close()
    }
  }, [])

  const isPlaying = playbackState === 'fading-in' || playbackState === 'on'

  return (
    <div className="ambient-audio">
      <span
        hidden
        data-testid="ambient-audio-engine"
        data-source={AUDIO_SOURCE}
        data-loop="true"
        data-context-state={contextState}
        data-duration={metadata?.duration ?? ''}
        data-channels={metadata?.channels ?? ''}
        data-sample-rate={metadata?.sampleRate ?? ''}
        data-offset={offsetRef.current.toFixed(3)}
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
