import { describe, expect, it } from 'vitest'
import {
  decayPointerInfluence,
  POINTER_BREEZE_DECAY_RATE,
  POINTER_BREEZE_HOLD_MS,
} from './pointerBreeze'

describe('pointer breeze envelope', () => {
  it('keeps a short hold before a gradual one-to-two-second decay', () => {
    expect(POINTER_BREEZE_HOLD_MS).toBeGreaterThanOrEqual(200)
    expect(POINTER_BREEZE_HOLD_MS).toBeLessThanOrEqual(350)
    expect(POINTER_BREEZE_DECAY_RATE).toBeGreaterThanOrEqual(1.75)
    expect(POINTER_BREEZE_DECAY_RATE).toBeLessThanOrEqual(2.35)

    let influence = 1
    for (let frame = 0; frame < 60; frame += 1) {
      influence = decayPointerInfluence(influence, 1 / 60)
    }
    expect(influence).toBeGreaterThan(0.1)
    expect(influence).toBeLessThan(0.15)

    for (let frame = 0; frame < 60; frame += 1) {
      influence = decayPointerInfluence(influence, 1 / 60)
    }
    expect(influence).toBeLessThan(0.03)
  })

  it('clamps invalid influence and frame gaps to safe bounds', () => {
    expect(decayPointerInfluence(2, 1)).toBeCloseTo(Math.exp(-POINTER_BREEZE_DECAY_RATE * 0.1))
    expect(decayPointerInfluence(-1, 1 / 60)).toBe(0)
    expect(decayPointerInfluence(0.5, -1)).toBe(0.5)
  })
})
