import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import fragmentShader from '../shaders/glimmerWater.frag?raw'
import vertexShader from '../shaders/fullscreen.vert?raw'
import type { GlitterSettings } from '../lib/glitterLab'

const MAX_PIXEL_RATIO = 1.75

function WaterSurface({ settings }: { settings: GlitterSettings }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()
  const drawingBufferSize = useMemo(() => new THREE.Vector2(), [])
  const reducedMotion = useRef(false)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uDensity: { value: 1 },
      uGlimmerSize: { value: 1 },
      uFlickerSpeed: { value: 1 },
      uHighlightIntensity: { value: 1 },
      uClustering: { value: 1 },
      uBloomIntensity: { value: 0 },
      uWaveStrength: { value: 1 },
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
    gl.domElement.dataset.visualSettings = JSON.stringify(settings)
  }, [gl, settings])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => {
      reducedMotion.current = query.matches
    }

    updatePreference()
    query.addEventListener('change', updatePreference)
    return () => query.removeEventListener('change', updatePreference)
  }, [])

  useFrame(({ clock }) => {
    const shader = material.current
    if (!shader) return

    gl.getDrawingBufferSize(drawingBufferSize)
    shader.uniforms.uResolution.value.copy(drawingBufferSize)
    shader.uniforms.uTime.value = clock.getElapsedTime() * (reducedMotion.current ? 0.35 : 1)
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
