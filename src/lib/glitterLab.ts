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
}

export const DEFAULT_GLITTER_SETTINGS: Readonly<GlitterSettings> = Object.freeze({
  density: 1,
  size: 1,
  flickerSpeed: 1,
  highlightIntensity: 1,
  clustering: 1,
  bloomIntensity: 0.32,
  waveStrength: 1,
  finePointRatio: 0.82,
  waterContrast: 1.15,
})

export function createDefaultGlitterSettings(): GlitterSettings {
  return { ...DEFAULT_GLITTER_SETTINGS }
}

export function serializeGlitterSettings(settings: GlitterSettings): string {
  return JSON.stringify(settings, null, 2)
}
