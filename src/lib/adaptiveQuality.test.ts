import { describe, expect, it } from 'vitest'
import {
  createAdaptiveQualityState,
  MAX_PIXEL_RATIO,
  qualityTier,
  updateAdaptiveQuality,
} from './adaptiveQuality'

describe('adaptive quality controller', () => {
  it('requires sustained slow windows before reducing pixel ratio', () => {
    let state = createAdaptiveQualityState(MAX_PIXEL_RATIO, MAX_PIXEL_RATIO)
    state = updateAdaptiveQuality(state, 40, MAX_PIXEL_RATIO)
    expect(state.pixelRatio).toBe(MAX_PIXEL_RATIO)
    state = updateAdaptiveQuality(state, 40, MAX_PIXEL_RATIO)
    expect(state.pixelRatio).toBe(1.5)
  })

  it('recovers more slowly than it degrades and never exceeds the device cap', () => {
    let state = createAdaptiveQualityState(1, MAX_PIXEL_RATIO)
    for (let sample = 0; sample < 4; sample += 1) {
      state = updateAdaptiveQuality(state, 60, MAX_PIXEL_RATIO)
    }
    expect(state.pixelRatio).toBe(1)
    state = updateAdaptiveQuality(state, 60, MAX_PIXEL_RATIO)
    expect(state.pixelRatio).toBe(1.25)

    for (let sample = 0; sample < 20; sample += 1) {
      state = updateAdaptiveQuality(state, 60, 1.5)
    }
    expect(state.pixelRatio).toBe(1.5)
  })

  it('reports stable QA tiers', () => {
    expect(qualityTier(1.75, 1.75)).toBe('full')
    expect(qualityTier(1.5, 1.75)).toBe('balanced')
    expect(qualityTier(1, 1.75)).toBe('reduced')
    expect(qualityTier(1, 1)).toBe('full')
  })
})
