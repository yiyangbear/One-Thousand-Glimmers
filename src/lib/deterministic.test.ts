import { describe, expect, it } from 'vitest'
import { hash01, seededPair } from './deterministic'

describe('deterministic helpers', () => {
  it('returns stable values in the unit interval', () => {
    expect(hash01(42)).toBe(hash01(42))
    expect(hash01(42)).toBeGreaterThanOrEqual(0)
    expect(hash01(42)).toBeLessThan(1)
  })

  it('changes the sample when the seed changes', () => {
    expect(seededPair(4, 11)).not.toEqual(seededPair(4, 12))
  })
})

