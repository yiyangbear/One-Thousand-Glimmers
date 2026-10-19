export const SUN_AZIMUTH_MIN = -70
export const SUN_AZIMUTH_MAX = 70
export const SUN_AZIMUTH_DRIFT_DEGREES = 24

const PRIMARY_CYCLE_SECONDS = 720
const SECONDARY_CYCLE_SECONDS = 233
const TAU = Math.PI * 2

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

/**
 * Returns a calm, deterministic azimuth drift around the art-directed center.
 * The two long, mismatched cycles avoid an obvious short back-and-forth loop.
 */
export function animatedSunAzimuth(centerDegrees: number, elapsedSeconds: number): number {
  const elapsed = Math.max(0, elapsedSeconds)
  const primary = Math.sin((elapsed / PRIMARY_CYCLE_SECONDS) * TAU)
  const secondary = Math.sin((elapsed / SECONDARY_CYCLE_SECONDS) * TAU)
  const drift = SUN_AZIMUTH_DRIFT_DEGREES * (primary * 0.88 + secondary * 0.12)

  return clamp(centerDegrees + drift, SUN_AZIMUTH_MIN, SUN_AZIMUTH_MAX)
}
