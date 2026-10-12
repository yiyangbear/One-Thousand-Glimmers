export function hash01(value: number): number {
  const x = Math.sin(value * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function seededPair(index: number, seed: number): readonly [number, number] {
  return [hash01(index + seed * 17.17), hash01(index * 1.731 + seed * 41.03)]
}

