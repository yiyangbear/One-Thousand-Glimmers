import { describe, expect, it } from 'vitest'
import {
  animatedSunAzimuth,
  SUN_AZIMUTH_MAX,
  SUN_AZIMUTH_MIN,
} from './sunMotion'

describe('animated sun azimuth', () => {
  it('starts at the configured center and evolves deterministically', () => {
    expect(animatedSunAzimuth(28, 0)).toBe(28)
    expect(animatedSunAzimuth(28, 60)).toBeCloseTo(animatedSunAzimuth(28, 60), 8)
    expect(animatedSunAzimuth(28, 60)).toBeGreaterThan(40)
    expect(animatedSunAzimuth(28, 180)).toBeGreaterThan(45)
  })

  it('moves gently over short intervals', () => {
    const start = animatedSunAzimuth(28, 10)
    const oneSecondLater = animatedSunAzimuth(28, 11)

    expect(Math.abs(oneSecondLater - start)).toBeGreaterThan(0.05)
    expect(Math.abs(oneSecondLater - start)).toBeLessThan(0.4)
  })

  it('keeps debug centers inside the supported shader range', () => {
    for (let second = 0; second <= 3_600; second += 5) {
      expect(animatedSunAzimuth(SUN_AZIMUTH_MIN, second)).toBeGreaterThanOrEqual(
        SUN_AZIMUTH_MIN,
      )
      expect(animatedSunAzimuth(SUN_AZIMUTH_MAX, second)).toBeLessThanOrEqual(
        SUN_AZIMUTH_MAX,
      )
    }
  })
})
