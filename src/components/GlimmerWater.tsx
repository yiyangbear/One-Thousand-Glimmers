import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import fragmentShader from '../shaders/glimmerWater.frag?raw'
import vertexShader from '../shaders/fullscreen.vert?raw'
import {
  createAdaptiveQualityState,
  MAX_PIXEL_RATIO,
  QUALITY_SAMPLE_SECONDS,
  qualityTier,
  updateAdaptiveQuality,
} from '../lib/adaptiveQuality'
import { DEFAULT_GLITTER_SETTINGS, type GlitterSettings } from '../lib/glitterLab'
import { decayPointerInfluence, POINTER_BREEZE_HOLD_MS } from '../lib/pointerBreeze'

type ArtworkCanvas = HTMLCanvasElement & { __pointerInfluence?: number }

function WaterSurface({ settings }: { settings: GlitterSettings }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { gl, setDpr } = useThree()
  const drawingBufferSize = useMemo(() => new THREE.Vector2(), [])
  const reducedMotion = useRef(false)
  const adaptiveQuality = useRef(createAdaptiveQualityState(1, MAX_PIXEL_RATIO))
  const qualitySample = useRef({ elapsed: 0, frames: 0 })
  const breeze = useRef({
    position: new THREE.Vector2(0.5, 0.5),
    previousPosition: new THREE.Vector2(0.5, 0.5),
    velocity: new THREE.Vector2(1, 0),
    directionScratch: new THREE.Vector2(),
    restVelocity: new THREE.Vector2(1, 0),
    influence: 0,
    lastTimestamp: 0,
    holdUntil: 0,
    hasSample: false,
  })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uDensity: { value: DEFAULT_GLITTER_SETTINGS.density },
      uGlimmerSize: { value: DEFAULT_GLITTER_SETTINGS.size },
      uFlickerSpeed: { value: DEFAULT_GLITTER_SETTINGS.flickerSpeed },
      uHighlightIntensity: { value: DEFAULT_GLITTER_SETTINGS.highlightIntensity },
      uClustering: { value: DEFAULT_GLITTER_SETTINGS.clustering },
      uBloomIntensity: { value: DEFAULT_GLITTER_SETTINGS.bloomIntensity },
      uWaveStrength: { value: DEFAULT_GLITTER_SETTINGS.waveStrength },
      uFinePointRatio: { value: DEFAULT_GLITTER_SETTINGS.finePointRatio },
      uWaterContrast: { value: DEFAULT_GLITTER_SETTINGS.waterContrast },
      uReflectionBandWidth: { value: DEFAULT_GLITTER_SETTINGS.reflectionBandWidth },
      uLocalCorrelation: { value: DEFAULT_GLITTER_SETTINGS.localCorrelation },
      uSunElevation: { value: DEFAULT_GLITTER_SETTINGS.sunElevation },
      uSunAzimuth: { value: DEFAULT_GLITTER_SETTINGS.sunAzimuth },
      uSunIntensity: { value: DEFAULT_GLITTER_SETTINGS.sunIntensity },
      uBreezeStrength: { value: DEFAULT_GLITTER_SETTINGS.breezeStrength },
      uPointerPosition: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerVelocity: { value: new THREE.Vector2(1, 0) },
      uPointerInfluence: { value: 0 },
    }),
    [],
  )

  useEffect(() => {
    const shader = material.current
    if (!shader) return

    shader.uniforms.uDensity.value = settings.density
    shader.uniforms.uGlimmerSize.value = settings.size
    shader.uniforms.uFlickerSpeed.value = settings.flickerSpeed
    shader.uniforms.uHighlightIntensity.value = settings.highlightIntensity
    shader.uniforms.uClustering.value = settings.clustering
    shader.uniforms.uBloomIntensity.value = settings.bloomIntensity
    shader.uniforms.uWaveStrength.value = settings.waveStrength
    shader.uniforms.uFinePointRatio.value = settings.finePointRatio
    shader.uniforms.uWaterContrast.value = settings.waterContrast
    shader.uniforms.uReflectionBandWidth.value = settings.reflectionBandWidth
    shader.uniforms.uLocalCorrelation.value = settings.localCorrelation
    shader.uniforms.uSunElevation.value = settings.sunElevation
    shader.uniforms.uSunAzimuth.value = settings.sunAzimuth
    shader.uniforms.uSunIntensity.value = settings.sunIntensity
    shader.uniforms.uBreezeStrength.value = settings.breezeStrength
    gl.domElement.dataset.visualSettings = JSON.stringify(settings)
  }, [gl, settings])

  useEffect(() => {
    const canvas = gl.domElement
    const maxPixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    adaptiveQuality.current = createAdaptiveQualityState(gl.getPixelRatio(), maxPixelRatio)
    canvas.dataset.pixelRatio = adaptiveQuality.current.pixelRatio.toFixed(2)
    canvas.dataset.qualityTier = qualityTier(adaptiveQuality.current.pixelRatio, maxPixelRatio)

    const state = breeze.current

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) return

      const x = THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
      const y = THREE.MathUtils.clamp(1 - (event.clientY - bounds.top) / bounds.height, 0, 1)
      const now = performance.now()

      state.position.set(x, y)
      if (state.hasSample) {
        const elapsed = Math.max((now - state.lastTimestamp) / 1000, 1 / 120)
        const deltaX = x - state.previousPosition.x
        const deltaY = y - state.previousPosition.y
        const velocityX = deltaX / elapsed
        const velocityY = deltaY / elapsed
        const speed = Math.min(Math.hypot(velocityX, velocityY), 2.5)
        const distance = Math.hypot(deltaX, deltaY)

        if (speed > 0.015 || distance > 0.002) {
          state.directionScratch.set(deltaX, deltaY).normalize()
          state.velocity.lerp(state.directionScratch, 0.58).normalize()
          const speedImpulse = THREE.MathUtils.smoothstep(speed, 0.03, 1.35)
          const distanceImpulse = THREE.MathUtils.smoothstep(distance, 0.002, 0.12) * 0.78
          const impulse = Math.max(speedImpulse, distanceImpulse)
          state.influence = Math.max(state.influence, impulse)
          state.holdUntil = now + POINTER_BREEZE_HOLD_MS
        }
      }

      state.previousPosition.set(x, y)
      state.lastTimestamp = now
      state.hasSample = true
    }

    const handlePointerLeave = () => {
      state.hasSample = false
    }

    canvas.addEventListener('pointermove', handlePointerMove, { passive: true })
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [gl])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => {
      reducedMotion.current = query.matches
      gl.domElement.dataset.motionRate = query.matches ? '0.35' : '1'
    }

    updatePreference()
    query.addEventListener('change', updatePreference)
    return () => query.removeEventListener('change', updatePreference)
  }, [gl])

  useFrame(({ clock }, delta) => {
    const shader = material.current
    if (!shader) return

    const state = breeze.current
    const boundedDelta = Math.min(delta, 0.1)
    if (performance.now() > state.holdUntil) {
      state.influence = decayPointerInfluence(state.influence, boundedDelta)
    }
    state.velocity.lerp(state.restVelocity, 1 - Math.exp(-boundedDelta * 0.45))

    gl.getDrawingBufferSize(drawingBufferSize)
    shader.uniforms.uResolution.value.copy(drawingBufferSize)
    shader.uniforms.uTime.value = clock.getElapsedTime() * (reducedMotion.current ? 0.35 : 1)
    shader.uniforms.uPointerPosition.value.copy(state.position)
    shader.uniforms.uPointerVelocity.value.copy(state.velocity)
    shader.uniforms.uPointerInfluence.value = state.influence
    const canvas = gl.domElement as ArtworkCanvas
    canvas.__pointerInfluence = state.influence

    if (document.visibilityState === 'visible') {
      qualitySample.current.elapsed += boundedDelta
      qualitySample.current.frames += 1
      if (qualitySample.current.elapsed >= QUALITY_SAMPLE_SECONDS) {
        const averageFps = qualitySample.current.frames / qualitySample.current.elapsed
        const maxPixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
        const nextQuality = updateAdaptiveQuality(
          adaptiveQuality.current,
          averageFps,
          maxPixelRatio,
        )
        if (nextQuality.pixelRatio !== adaptiveQuality.current.pixelRatio) {
          setDpr(nextQuality.pixelRatio)
        }
        adaptiveQuality.current = nextQuality
        canvas.dataset.averageFps = averageFps.toFixed(1)
        canvas.dataset.pixelRatio = nextQuality.pixelRatio.toFixed(2)
        canvas.dataset.qualityTier = qualityTier(nextQuality.pixelRatio, maxPixelRatio)
        qualitySample.current.elapsed = 0
        qualitySample.current.frames = 0
      }
    } else {
      qualitySample.current.elapsed = 0
      qualitySample.current.frames = 0
    }
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export function GlimmerWater({ settings }: { settings: GlitterSettings }) {
  return (
    <Canvas
      className="water-canvas"
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, MAX_PIXEL_RATIO]}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#172b32', 1)
        gl.domElement.dataset.renderer = 'ready'
      }}
    >
      <WaterSurface settings={settings} />
    </Canvas>
  )
}
