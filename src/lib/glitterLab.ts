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
  density: 0.61,
  size: 1.65,
  flickerSpeed: 3,
  highlightIntensity: 2.53,
  clustering: 0,
  bloomIntensity: 0.34,
  waveStrength: 0.36,
  finePointRatio: 0.96,
  waterContrast: 1.6,
  reflectionBandWidth: 0.76,
  localCorrelation: 0.7,
})

export function createDefaultGlitterSettings(): GlitterSettings {
  return { ...DEFAULT_GLITTER_SETTINGS }
}

export function serializeGlitterSettings(settings: GlitterSettings): string {
  return JSON.stringify(settings, null, 2)
}
