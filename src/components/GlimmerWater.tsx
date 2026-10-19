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
import { emitInteractionSound } from '../lib/interactionAudio'
import {
  decayPointerClickInfluence,
  decayPointerInfluence,
  POINTER_BREEZE_ATTACK_RATE,
  POINTER_BREEZE_HOLD_MS,
  POINTER_CLICK_ATTACK_RATE,
  POINTER_CLICK_HOLD_MS,
  POINTER_CLICK_RELEASE_HOLD_MS,
  risePointerInfluence,
} from '../lib/pointerBreeze'
import { animatedSunAzimuth } from '../lib/sunMotion'

type ArtworkCanvas = HTMLCanvasElement & {
  __pointerClickInfluence?: number
  __pointerDragInfluence?: number
  __pointerInfluence?: number
}

function WaterSurface({ settings }: { settings: GlitterSettings }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { gl, setDpr } = useThree()
  const drawingBufferSize = useMemo(() => new THREE.Vector2(), [])
  const reducedMotion = useRef(false)
  const sunTimeline = useRef({ elapsed: 0, lastTimestamp: 0 })
  const adaptiveQuality = useRef(createAdaptiveQualityState(1, MAX_PIXEL_RATIO))
  const qualitySample = useRef({ elapsed: 0, frames: 0 })
  const breeze = useRef({
    position: new THREE.Vector2(0.5, 0.5),
    previousPosition: new THREE.Vector2(0.5, 0.5),
    velocity: new THREE.Vector2(1, 0),
    directionScratch: new THREE.Vector2(),
    restVelocity: new THREE.Vector2(1, 0),
    influence: 0,
    dragTarget: 0,
    dragAttackStart: 0,
    dragAttackStartedAt: 0,
    clickInfluence: 0,
    clickTarget: 0,
    clickAttackStart: 0,
    clickAttackStartedAt: 0,
    clickHoldUntil: 0,
    lastTimestamp: 0,
    holdUntil: 0,
    hasSample: false,
    isPressed: false,
    activePointerId: null as number | null,
    dragSoundPlayed: false,
    dragDistance: 0,
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
      uPointerClickInfluence: { value: 0 },
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
    const artworkCanvas = canvas as ArtworkCanvas
    const maxPixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    adaptiveQuality.current = createAdaptiveQualityState(gl.getPixelRatio(), maxPixelRatio)
    canvas.dataset.pixelRatio = adaptiveQuality.current.pixelRatio.toFixed(2)
    canvas.dataset.qualityTier = qualityTier(adaptiveQuality.current.pixelRatio, maxPixelRatio)

    const state = breeze.current

    const pointerCoordinates = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) return null
      return {
        x: THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
        y: THREE.MathUtils.clamp(1 - (event.clientY - bounds.top) / bounds.height, 0, 1),
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
      const coordinates = pointerCoordinates(event)
      if (!coordinates) return

      const now = performance.now()
      state.position.set(coordinates.x, coordinates.y)
      state.previousPosition.set(coordinates.x, coordinates.y)
      state.lastTimestamp = now
      state.holdUntil = now
      state.hasSample = true
      state.isPressed = true
      state.activePointerId = event.pointerId
      state.dragSoundPlayed = false
      state.dragDistance = 0
      state.clickInfluence = Math.min(state.clickInfluence, 0.08)
      state.clickTarget = 1
      state.clickAttackStart = state.clickInfluence
      state.clickAttackStartedAt = now
      state.clickHoldUntil = now + POINTER_CLICK_HOLD_MS
      state.influence = 0
      state.dragTarget = 0
      state.dragAttackStart = 0
      state.dragAttackStartedAt = now
      canvas.setPointerCapture(event.pointerId)
      artworkCanvas.__pointerClickInfluence = state.clickInfluence
      emitInteractionSound(window, 'click')
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!state.isPressed || event.pointerId !== state.activePointerId) return
      const coordinates = pointerCoordinates(event)
      if (!coordinates) return
      const { x, y } = coordinates
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
          state.dragDistance = Math.min(state.dragDistance + distance, 0.3)
          state.directionScratch.set(deltaX, deltaY).normalize()
          state.velocity.lerp(state.directionScratch, 0.58).normalize()
          const speedImpulse = THREE.MathUtils.smoothstep(speed, 0.03, 1.35)
          const distanceImpulse = THREE.MathUtils.smoothstep(distance, 0.002, 0.12) * 0.78
          const gestureImpulse =
            THREE.MathUtils.smoothstep(state.dragDistance, 0.008, 0.16) * 0.92
          const impulse = Math.max(speedImpulse, distanceImpulse, gestureImpulse)
          if (impulse > state.dragTarget) {
            state.dragAttackStart = state.influence
            state.dragAttackStartedAt = now
            state.dragTarget = impulse
          }
          state.holdUntil = now + POINTER_BREEZE_HOLD_MS
          if (!state.dragSoundPlayed && impulse > 0.12) {
            state.dragSoundPlayed = true
            emitInteractionSound(window, 'drag')
          }
        }
      }

      state.previousPosition.set(x, y)
      state.lastTimestamp = now
      state.hasSample = true
    }

    const finishPointerGesture = (event: PointerEvent) => {
      if (event.pointerId !== state.activePointerId) return
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      if (Math.max(state.influence, state.dragTarget) > 0.001) {
        state.holdUntil = performance.now() + POINTER_BREEZE_HOLD_MS
      }
      if (state.clickTarget > 0.001) {
        state.clickHoldUntil = performance.now() + POINTER_CLICK_RELEASE_HOLD_MS
      }
      state.isPressed = false
      state.activePointerId = null
      state.hasSample = false
    }

    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true })
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true })
    canvas.addEventListener('pointerup', finishPointerGesture, { passive: true })
    canvas.addEventListener('pointercancel', finishPointerGesture, { passive: true })
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', finishPointerGesture)
      canvas.removeEventListener('pointercancel', finishPointerGesture)
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

  useEffect(() => {
    const resetSunTimestamp = () => {
      sunTimeline.current.lastTimestamp = performance.now()
    }

    resetSunTimestamp()
    document.addEventListener('visibilitychange', resetSunTimestamp)
    return () => document.removeEventListener('visibilitychange', resetSunTimestamp)
  }, [])

  useFrame(({ clock }, delta) => {
    const shader = material.current
    if (!shader) return

    const state = breeze.current
    const boundedDelta = Math.min(delta, 0.1)
    const now = performance.now()
    if (state.isPressed && state.clickTarget > 0.001) {
      state.clickHoldUntil = now + POINTER_CLICK_HOLD_MS
    }
    if (state.isPressed || now <= state.holdUntil) {
      state.influence = risePointerInfluence(
        state.dragAttackStart,
        state.dragTarget,
        (now - state.dragAttackStartedAt) / 1000,
        POINTER_BREEZE_ATTACK_RATE,
      )
    } else {
      state.dragTarget = 0
      state.influence = decayPointerInfluence(state.influence, boundedDelta)
    }
    if (now <= state.clickHoldUntil) {
      state.clickInfluence = risePointerInfluence(
        state.clickAttackStart,
        state.clickTarget,
        (now - state.clickAttackStartedAt) / 1000,
        POINTER_CLICK_ATTACK_RATE,
      )
    } else {
      state.clickTarget = 0
      state.clickInfluence = decayPointerClickInfluence(state.clickInfluence, boundedDelta)
    }
    state.velocity.lerp(state.restVelocity, 1 - Math.exp(-boundedDelta * 0.45))

    gl.getDrawingBufferSize(drawingBufferSize)
    shader.uniforms.uResolution.value.copy(drawingBufferSize)
    shader.uniforms.uTime.value = clock.getElapsedTime() * (reducedMotion.current ? 0.35 : 1)
    const sunNow = performance.now()
    const sunState = sunTimeline.current
    const visibleElapsed = Math.min(
      Math.max((sunNow - sunState.lastTimestamp) / 1000, 0),
      1,
    )
    sunState.lastTimestamp = sunNow
    if (document.visibilityState === 'visible') {
      sunState.elapsed += visibleElapsed * (reducedMotion.current ? 0.35 : 1)
    }
    const currentSunAzimuth = animatedSunAzimuth(settings.sunAzimuth, sunState.elapsed)
    shader.uniforms.uSunAzimuth.value = currentSunAzimuth
    shader.uniforms.uPointerPosition.value.copy(state.position)
    shader.uniforms.uPointerVelocity.value.copy(state.velocity)
    shader.uniforms.uPointerInfluence.value = state.influence
    shader.uniforms.uPointerClickInfluence.value = state.clickInfluence
    const canvas = gl.domElement as ArtworkCanvas
    canvas.__pointerClickInfluence = state.clickInfluence
    canvas.__pointerDragInfluence = state.influence
    canvas.__pointerInfluence = Math.max(state.influence, state.clickInfluence)
    canvas.dataset.pointerGesture = state.isPressed ? 'pressed' : 'idle'
    canvas.dataset.sunAzimuth = currentSunAzimuth.toFixed(2)
    canvas.dataset.sunAzimuthCenter = settings.sunAzimuth.toFixed(2)
    canvas.dataset.sunElapsed = sunState.elapsed.toFixed(2)

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
