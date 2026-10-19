export const POINTER_BREEZE_HOLD_MS = 500
export const POINTER_CLICK_HOLD_MS = 900
export const POINTER_CLICK_RELEASE_HOLD_MS = 350
export const POINTER_BREEZE_ATTACK_RATE = 8
export const POINTER_CLICK_ATTACK_RATE = 10
export const POINTER_BREEZE_DECAY_RATE = 2.2
export const POINTER_CLICK_DECAY_RATE = 2.7

export function risePointerInfluence(
  influence: number,
  target: number,
  deltaSeconds: number,
  attackRate: number,
): number {
  const boundedInfluence = Math.min(Math.max(influence, 0), 1)
  const boundedTarget = Math.min(Math.max(target, boundedInfluence), 1)
  const boundedDelta = Math.min(Math.max(deltaSeconds, 0), 1)
  const boundedRate = Math.max(attackRate, 0)
  return boundedInfluence +
    (boundedTarget - boundedInfluence) * (1 - Math.exp(-boundedDelta * boundedRate))
}

export function decayPointerInfluence(influence: number, deltaSeconds: number): number {
  const boundedInfluence = Math.min(Math.max(influence, 0), 1)
  const boundedDelta = Math.min(Math.max(deltaSeconds, 0), 0.1)
  return boundedInfluence * Math.exp(-boundedDelta * POINTER_BREEZE_DECAY_RATE)
}

export function decayPointerClickInfluence(influence: number, deltaSeconds: number): number {
  const boundedInfluence = Math.min(Math.max(influence, 0), 1)
  const boundedDelta = Math.min(Math.max(deltaSeconds, 0), 0.1)
  return boundedInfluence * Math.exp(-boundedDelta * POINTER_CLICK_DECAY_RATE)
}
