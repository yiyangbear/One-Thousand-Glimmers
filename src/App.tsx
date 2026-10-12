import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import { GlitterLab } from './components/GlitterLab'
import { GlimmerWater } from './components/GlimmerWater'
import { createDefaultGlitterSettings } from './lib/glitterLab'

type ErrorBoundaryState = { failed: boolean }

class WebGLErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unable to initialize the river renderer.', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="render-fallback" role="alert">
          <p>这片水面暂时无法在当前浏览器中呈现。</p>
        </main>
      )
    }

    return this.props.children
  }
}

export function App() {
  const [settings, setSettings] = useState(createDefaultGlitterSettings)
  const showGlitterLab = new URLSearchParams(window.location.search).get('debug') === 'true'

  return (
    <WebGLErrorBoundary>
      <main className="artwork" aria-label="阳光在深蓝灰色江面上安静地明灭">
        <GlimmerWater settings={settings} />
        {showGlitterLab && <GlitterLab settings={settings} onChange={setSettings} />}
      </main>
    </WebGLErrorBoundary>
  )
}
