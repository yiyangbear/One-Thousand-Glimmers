import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GLITTER_SETTINGS,
  createDefaultGlitterSettings,
  serializeGlitterSettings,
} from './glitterLab'

describe('Glitter Lab settings', () => {
  it('stores the art-directed multi-layer defaults', () => {
    expect(DEFAULT_GLITTER_SETTINGS).toEqual({
      density: 1,
      size: 1,
      flickerSpeed: 1,
      highlightIntensity: 1,
      clustering: 1,
      bloomIntensity: 0.32,
      waveStrength: 1,
      finePointRatio: 0.82,
      waterContrast: 1.15,
    })
  })

  it('creates independent reset values and serializes valid JSON', () => {
    const first = createDefaultGlitterSettings()
    const second = createDefaultGlitterSettings()
    first.density = 1.5

    expect(second).toEqual(DEFAULT_GLITTER_SETTINGS)
    expect(JSON.parse(serializeGlitterSettings(second))).toEqual(DEFAULT_GLITTER_SETTINGS)
  })
})
