import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import fragmentShader from '../shaders/glimmerWater.frag?raw'
import vertexShader from '../shaders/fullscreen.vert?raw'
import { DEFAULT_GLITTER_SETTINGS, type GlitterSettings } from '../lib/glitterLab'

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
