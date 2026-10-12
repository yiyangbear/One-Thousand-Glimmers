import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GLITTER_SETTINGS,
  createDefaultGlitterSettings,
  serializeGlitterSettings,
} from './glitterLab'

describe('Glitter Lab settings', () => {
  it('stores the art-directed multi-layer defaults', () => {
    expect(DEFAULT_GLITTER_SETTINGS).toEqual({
      density: 0.72,
      size: 1.45,
      flickerSpeed: 1,
      highlightIntensity: 2.53,
      clustering: 0.06,
      bloomIntensity: 0.22,
      waveStrength: 1.49,
      finePointRatio: 0.96,
      waterContrast: 1.6,
      reflectionBandWidth: 0.78,
      localCorrelation: 0.72,
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
