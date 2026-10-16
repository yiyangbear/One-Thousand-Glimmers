import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GLITTER_SETTINGS,
  createDefaultGlitterSettings,
  serializeGlitterSettings,
} from './glitterLab'

describe('Glitter Lab settings', () => {
  it('stores the art-directed multi-layer defaults', () => {
    expect(DEFAULT_GLITTER_SETTINGS).toEqual({
      density: 1.23,
      size: 1.65,
      flickerSpeed: 7.5,
      highlightIntensity: 2.65,
      clustering: 0,
      bloomIntensity: 0.66,
      waveStrength: 0.42,
      finePointRatio: 1.16,
      waterContrast: 1.6,
      reflectionBandWidth: 0.82,
      localCorrelation: 0.7,
      sunElevation: 24,
      sunAzimuth: 28,
      sunIntensity: 1,
      breezeStrength: 0.42,
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
