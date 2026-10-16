export const POINTER_BREEZE_HOLD_MS = 260
export const POINTER_BREEZE_DECAY_RATE = 2.05

export function decayPointerInfluence(influence: number, deltaSeconds: number): number {
  const boundedInfluence = Math.min(Math.max(influence, 0), 1)
  const boundedDelta = Math.min(Math.max(deltaSeconds, 0), 0.1)
  return boundedInfluence * Math.exp(-boundedDelta * POINTER_BREEZE_DECAY_RATE)
}
