import { useEffect, useMemo, useRef } from 'react'
import {
  DEFAULT_INTERACTION_SOUND_FILES,
  INTERACTION_SOUND_EVENT,
  clampInteractionSoundVolume,
  resolveConfiguredInteractionSoundUrl,
  type InteractionSoundKind,
} from '../lib/interactionAudio'

// The supplied click master is approximately 10.6 dB quieter than the drag master.
// These gains bring their RMS energy close together while keeping both beneath the music.
const CLICK_VOLUME = 1
const DRAG_VOLUME = 0.32
const VOLUME_SMOOTHING_SECONDS = 0.04

type InteractionAudioProps = {
  enabled: boolean
  volume: number
}

export function InteractionAudio({ enabled, volume }: InteractionAudioProps) {
  const contextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const enabledRef = useRef(enabled)
  const volumeRef = useRef(enabled ? clampInteractionSoundVolume(volume) : 0)
  const playCountRef = useRef(0)
  const telemetryRef = useRef<HTMLSpanElement | null>(null)
  const buffersRef = useRef(new Map<string, Promise<AudioBuffer>>())
  const activeSourcesRef = useRef(new Set<AudioBufferSourceNode>())
  const disposedRef = useRef(false)
  const sources = useMemo(
    () => ({
      click: resolveConfiguredInteractionSoundUrl(
        import.meta.env.VITE_POINTER_CLICK_SOUND,
        DEFAULT_INTERACTION_SOUND_FILES.click,
        import.meta.env.BASE_URL,
      ),
      drag: resolveConfiguredInteractionSoundUrl(
        import.meta.env.VITE_POINTER_DRAG_SOUND,
        DEFAULT_INTERACTION_SOUND_FILES.drag,
        import.meta.env.BASE_URL,
      ),
    }),
    [],
  )

  const boundedVolume = clampInteractionSoundVolume(volume)
  const effectiveVolume = enabled ? boundedVolume : 0

  useEffect(() => {
    enabledRef.current = enabled
    volumeRef.current = effectiveVolume
    const context = contextRef.current
    const masterGain = masterGainRef.current
    if (!context || !masterGain || context.state === 'closed') return

    const now = context.currentTime
    masterGain.gain.cancelScheduledValues(now)
    masterGain.gain.setTargetAtTime(effectiveVolume, now, VOLUME_SMOOTHING_SECONDS)
    if (telemetryRef.current) {
      telemetryRef.current.dataset.masterVolume = effectiveVolume.toFixed(2)
    }
  }, [effectiveVolume, enabled])

  useEffect(() => {
    disposedRef.current = false

    const loadBuffer = (context: AudioContext, source: string) => {
      const cached = buffersRef.current.get(source)
      if (cached) return cached

      const pending = fetch(source)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Interaction audio request failed with ${response.status}`)
          }
          return response.arrayBuffer()
        })
        .then((bytes) => context.decodeAudioData(bytes))
      buffersRef.current.set(source, pending)
      return pending
    }

    const play = async (kind: InteractionSoundKind) => {
      if (!enabledRef.current) return
      const sourceUrl = sources[kind]
      if (!sourceUrl) return

      try {
        let context = contextRef.current
        if (!context) {
          context = new AudioContext()
          const masterGain = context.createGain()
          masterGain.gain.value = volumeRef.current
          masterGain.connect(context.destination)
          contextRef.current = context
          masterGainRef.current = masterGain
          if (telemetryRef.current) {
            telemetryRef.current.dataset.masterVolume = volumeRef.current.toFixed(2)
          }
        }
        await context.resume()
        const buffer = await loadBuffer(context, sourceUrl)
        if (disposedRef.current || !enabledRef.current || context.state === 'closed') return

        const source = context.createBufferSource()
        const gain = context.createGain()
        source.buffer = buffer
        gain.gain.value = kind === 'click' ? CLICK_VOLUME : DRAG_VOLUME
        source.connect(gain)
        gain.connect(masterGainRef.current ?? context.destination)
        activeSourcesRef.current.add(source)
        if (telemetryRef.current) {
          playCountRef.current += 1
          telemetryRef.current.dataset.playCount = String(playCountRef.current)
        }
        source.addEventListener(
          'ended',
          () => {
            activeSourcesRef.current.delete(source)
            source.disconnect()
            gain.disconnect()
          },
          { once: true },
        )
        source.start()
      } catch (error) {
        console.warn(`Unable to play the ${kind} interaction sound.`, error)
      }
    }

    const handleSoundRequest = (event: Event) => {
      const kind = (event as CustomEvent<InteractionSoundKind>).detail
      if (kind === 'click' || kind === 'drag') void play(kind)
    }

    window.addEventListener(INTERACTION_SOUND_EVENT, handleSoundRequest)
    return () => {
      disposedRef.current = true
      window.removeEventListener(INTERACTION_SOUND_EVENT, handleSoundRequest)
      for (const source of activeSourcesRef.current) {
        try {
          source.stop()
        } catch {
          // A one-shot source may already have ended.
        }
        source.disconnect()
      }
      activeSourcesRef.current.clear()
      buffersRef.current.clear()
      masterGainRef.current?.disconnect()
      masterGainRef.current = null
      void contextRef.current?.close()
      contextRef.current = null
    }
  }, [sources])

  return (
    <span
      ref={telemetryRef}
      hidden
      data-testid="interaction-audio-engine"
      data-click-source={sources.click ?? ''}
      data-drag-source={sources.drag ?? ''}
      data-enabled={String(enabled)}
      data-play-count={String(playCountRef.current)}
      data-volume={boundedVolume.toFixed(2)}
    />
  )
}
