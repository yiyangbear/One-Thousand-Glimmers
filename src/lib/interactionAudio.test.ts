import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_INTERACTION_SOUND_FILES,
  clampInteractionSoundVolume,
  emitInteractionSound,
  INTERACTION_SOUND_EVENT,
  resolveConfiguredInteractionSoundUrl,
  resolveInteractionSoundUrl,
} from './interactionAudio'

describe('interaction audio interface', () => {
  it('clamps the master volume to a safe finite range', () => {
    expect(clampInteractionSoundVolume(-0.5)).toBe(0)
    expect(clampInteractionSoundVolume(0.1)).toBe(0.1)
    expect(clampInteractionSoundVolume(1.5)).toBe(1)
    expect(clampInteractionSoundVolume(Number.NaN)).toBe(0)
  })

  it('keeps unconfigured effects silent without a resource request', () => {
    expect(resolveInteractionSoundUrl(undefined, '/One-Thousand-Glimmers/')).toBeNull()
    expect(resolveInteractionSoundUrl('  ', '/One-Thousand-Glimmers/')).toBeNull()
  })

  it('resolves audio filenames beneath the deployed audio path', () => {
    expect(resolveInteractionSoundUrl('glimmer-click.mp3', '/One-Thousand-Glimmers/')).toBe(
      '/One-Thousand-Glimmers/audio/glimmer-click.mp3',
    )
    expect(resolveInteractionSoundUrl('audio/glimmer-drag.mp3', '/')).toBe(
      '/audio/glimmer-drag.mp3',
    )
  })

  it('uses bundled WAV effects by default while allowing an explicit blank opt-out', () => {
    expect(
      resolveConfiguredInteractionSoundUrl(
        undefined,
        DEFAULT_INTERACTION_SOUND_FILES.click,
        '/One-Thousand-Glimmers/',
      ),
    ).toBe('/One-Thousand-Glimmers/audio/glimmer-click.wav')
    expect(
      resolveConfiguredInteractionSoundUrl(
        '  ',
        DEFAULT_INTERACTION_SOUND_FILES.drag,
        '/',
      ),
    ).toBeNull()
  })

  it('emits distinct click and drag requests', () => {
    const target = new EventTarget()
    const listener = vi.fn()
    target.addEventListener(INTERACTION_SOUND_EVENT, listener)

    emitInteractionSound(target, 'click')
    emitInteractionSound(target, 'drag')

    expect(listener).toHaveBeenCalledTimes(2)
  })
})
