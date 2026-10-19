import { describe, expect, it } from 'vitest'
import {
  decayPointerClickInfluence,
  decayPointerInfluence,
  POINTER_BREEZE_ATTACK_RATE,
  POINTER_BREEZE_DECAY_RATE,
  POINTER_BREEZE_HOLD_MS,
  POINTER_CLICK_ATTACK_RATE,
  POINTER_CLICK_HOLD_MS,
  POINTER_CLICK_RELEASE_HOLD_MS,
  risePointerInfluence,
} from './pointerBreeze'

describe('pointer breeze envelope', () => {
  it('eases click and drag influence in instead of switching on in one frame', () => {
    const firstClickFrame = risePointerInfluence(0, 1, 1 / 60, POINTER_CLICK_ATTACK_RATE)
    const firstDragFrame = risePointerInfluence(0, 1, 1 / 60, POINTER_BREEZE_ATTACK_RATE)

    expect(firstClickFrame).toBeGreaterThan(0.1)
    expect(firstClickFrame).toBeLessThan(0.2)
    expect(firstDragFrame).toBeGreaterThan(0.1)
    expect(firstDragFrame).toBeLessThan(firstClickFrame)

    let influence = 0
    for (let frame = 0; frame < 18; frame += 1) {
      influence = risePointerInfluence(influence, 1, 1 / 60, POINTER_CLICK_ATTACK_RATE)
    }
    expect(influence).toBeGreaterThan(0.9)
    expect(influence).toBeLessThan(1)
  })

  it('keeps a short hold before a gradual one-to-two-second decay', () => {
    expect(POINTER_BREEZE_HOLD_MS).toBeGreaterThanOrEqual(450)
    expect(POINTER_BREEZE_HOLD_MS).toBeLessThanOrEqual(600)
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

  it('gives a standalone press a short continuous decay', () => {
    expect(POINTER_CLICK_HOLD_MS).toBeGreaterThanOrEqual(800)
    expect(POINTER_CLICK_HOLD_MS).toBeLessThanOrEqual(1_000)
    expect(POINTER_CLICK_RELEASE_HOLD_MS).toBeGreaterThanOrEqual(250)
    expect(POINTER_CLICK_RELEASE_HOLD_MS).toBeLessThanOrEqual(450)

    let influence = 1
    for (let frame = 0; frame < 90; frame += 1) {
      influence = decayPointerClickInfluence(influence, 1 / 60)
    }

    expect(influence).toBeGreaterThan(0)
    expect(influence).toBeLessThan(0.02)
  })
})
