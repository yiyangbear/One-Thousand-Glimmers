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
}

export const DEFAULT_GLITTER_SETTINGS: Readonly<GlitterSettings> = Object.freeze({
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

export function createDefaultGlitterSettings(): GlitterSettings {
  return { ...DEFAULT_GLITTER_SETTINGS }
}

export function serializeGlitterSettings(settings: GlitterSettings): string {
  return JSON.stringify(settings, null, 2)
}
