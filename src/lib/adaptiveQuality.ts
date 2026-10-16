export const MIN_PIXEL_RATIO = 1
export const MAX_PIXEL_RATIO = 1.75
export const QUALITY_SAMPLE_SECONDS = 1.5

const PIXEL_RATIO_STEP = 0.25
const SLOW_FPS_THRESHOLD = 45
const FAST_FPS_THRESHOLD = 56
const SLOW_WINDOWS_TO_REDUCE = 2
const FAST_WINDOWS_TO_RECOVER = 5

export type AdaptiveQualityState = {
  pixelRatio: number
  slowWindows: number
  fastWindows: number
}

export function clampPixelRatio(pixelRatio: number, maxPixelRatio: number): number {
  return Math.min(Math.max(pixelRatio, MIN_PIXEL_RATIO), Math.max(maxPixelRatio, MIN_PIXEL_RATIO))
}

export function createAdaptiveQualityState(
  pixelRatio: number,
  maxPixelRatio: number,
): AdaptiveQualityState {
  return {
    pixelRatio: clampPixelRatio(pixelRatio, maxPixelRatio),
    slowWindows: 0,
    fastWindows: 0,
  }
}

export function updateAdaptiveQuality(
  state: AdaptiveQualityState,
  averageFps: number,
  maxPixelRatio: number,
): AdaptiveQualityState {
  const boundedMax = Math.max(maxPixelRatio, MIN_PIXEL_RATIO)
  let slowWindows = averageFps < SLOW_FPS_THRESHOLD ? state.slowWindows + 1 : 0
  let fastWindows = averageFps > FAST_FPS_THRESHOLD ? state.fastWindows + 1 : 0
  let pixelRatio = clampPixelRatio(state.pixelRatio, boundedMax)

  if (slowWindows >= SLOW_WINDOWS_TO_REDUCE && pixelRatio > MIN_PIXEL_RATIO) {
    pixelRatio = clampPixelRatio(pixelRatio - PIXEL_RATIO_STEP, boundedMax)
    slowWindows = 0
    fastWindows = 0
  } else if (fastWindows >= FAST_WINDOWS_TO_RECOVER && pixelRatio < boundedMax) {
    pixelRatio = clampPixelRatio(pixelRatio + PIXEL_RATIO_STEP, boundedMax)
    slowWindows = 0
    fastWindows = 0
  }

  return { pixelRatio, slowWindows, fastWindows }
}

export function qualityTier(pixelRatio: number, maxPixelRatio: number): string {
  if (pixelRatio <= MIN_PIXEL_RATIO + 0.01 && maxPixelRatio > MIN_PIXEL_RATIO + 0.01) {
    return 'reduced'
  }
  if (pixelRatio >= maxPixelRatio - 0.01) return 'full'
  return 'balanced'
}
