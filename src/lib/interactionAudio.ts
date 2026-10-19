export const INTERACTION_SOUND_EVENT = 'one-thousand-glimmers:interaction-sound'

export const DEFAULT_INTERACTION_SOUND_FILES = {
  click: 'glimmer-click.wav',
  drag: 'glimmer-drag.wav',
} as const

export type InteractionSoundKind = 'click' | 'drag'

export function clampInteractionSoundVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0
  return Math.min(Math.max(volume, 0), 1)
}

export function resolveInteractionSoundUrl(
  fileName: string | undefined,
  baseUrl: string,
): string | null {
  const source = fileName?.trim()
  if (!source) return null
  if (/^(?:https?:|data:|blob:)/.test(source)) return source

  const relativeSource = source.replace(/^\/+/, '')
  const audioPath = relativeSource.startsWith('audio/')
    ? relativeSource
    : `audio/${relativeSource}`
  return `${baseUrl.replace(/\/$/, '')}/${audioPath}`
}

export function resolveConfiguredInteractionSoundUrl(
  configuredFileName: string | undefined,
  defaultFileName: string,
  baseUrl: string,
): string | null {
  return resolveInteractionSoundUrl(configuredFileName ?? defaultFileName, baseUrl)
}

export function emitInteractionSound(target: EventTarget, kind: InteractionSoundKind): void {
  target.dispatchEvent(
    new CustomEvent<InteractionSoundKind>(INTERACTION_SOUND_EVENT, { detail: kind }),
  )
}
