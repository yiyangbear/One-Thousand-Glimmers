export type GlitterSettings = {
  density: number
  size: number
  flickerSpeed: number
  highlightIntensity: number
  clustering: number
  bloomIntensity: number
  waveStrength: number
  finePointRatio: number
  waterContrast: number
  reflectionBandWidth: number
  localCorrelation: number
  sunElevation: number
  sunAzimuth: number
  sunIntensity: number
  breezeStrength: number
}

export const DEFAULT_GLITTER_SETTINGS: Readonly<GlitterSettings> = Object.freeze({
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

export function createDefaultGlitterSettings(): GlitterSettings {
  return { ...DEFAULT_GLITTER_SETTINGS }
}

export function serializeGlitterSettings(settings: GlitterSettings): string {
  return JSON.stringify(settings, null, 2)
}
