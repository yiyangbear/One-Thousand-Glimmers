import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_GLITTER_SETTINGS,
  serializeGlitterSettings,
  type GlitterSettings,
} from '../lib/glitterLab'

type ImplementedControl = {
  key: keyof GlitterSettings
  label: string
  min: number
  max: number
  step: number
}

const CONTROLS: readonly ImplementedControl[] = [
  { key: 'density', label: '光点密度', min: 0, max: 2, step: 0.01 },
  { key: 'size', label: '光点大小', min: 0.5, max: 2, step: 0.01 },
  { key: 'flickerSpeed', label: '闪烁速度', min: 0.1, max: 10, step: 0.01 },
  { key: 'sunElevation', label: '太阳高度角', min: 5, max: 75, step: 1 },
  { key: 'sunAzimuth', label: '太阳方位角中心', min: -70, max: 70, step: 1 },
  { key: 'sunIntensity', label: '太阳光照强度', min: 0.2, max: 2, step: 0.01 },
  { key: 'highlightIntensity', label: '高光响应增益', min: 0, max: 3, step: 0.01 },
  { key: 'finePointRatio', label: '微光占比', min: 0.2, max: 1.2, step: 0.01 },
  { key: 'clustering', label: '光点聚集程度', min: 0, max: 2, step: 0.01 },
  { key: 'bloomIntensity', label: '高亮辉光强度', min: 0, max: 1.5, step: 0.01 },
  { key: 'waveStrength', label: '水波起伏强度', min: 0, max: 2, step: 0.01 },
  { key: 'breezeStrength', label: '鼠标微风扰动强度', min: 0, max: 1, step: 0.01 },
  { key: 'interactionSoundVolume', label: '交互音效音量', min: 0, max: 1, step: 0.01 },
  { key: 'waterContrast', label: '水面深浅层次', min: 0.3, max: 2, step: 0.01 },
  { key: 'reflectionBandWidth', label: '主反光区域宽度', min: 0.35, max: 1.6, step: 0.01 },
  { key: 'localCorrelation', label: '局部相关闪烁', min: 0, max: 1, step: 0.01 },
]

type GlitterLabProps = {
  settings: GlitterSettings
  onChange: (settings: GlitterSettings) => void
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function GlitterLab({ settings, onChange }: GlitterLabProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const resetStatusTimer = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(resetStatusTimer.current)
    },
    [],
  )

  const updateSetting = (key: keyof GlitterSettings, value: number) => {
    onChange({ ...settings, [key]: value })
  }

  const handleCopy = async () => {
    window.clearTimeout(resetStatusTimer.current)
    try {
      await copyText(serializeGlitterSettings(settings))
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
    resetStatusTimer.current = window.setTimeout(() => setCopyStatus('idle'), 2_000)
  }

  return (
    <aside className="glitter-lab" aria-label="Glitter Lab 开发面板">
      <details open>
        <summary>
          <span>Glitter Lab</span>
          <span className="glitter-lab__summary-hint" aria-hidden="true">
            调整
          </span>
        </summary>

        <div className="glitter-lab__body">
          <p className="glitter-lab__eyebrow">实时视觉参数</p>

          <div className="glitter-lab__controls">
            {CONTROLS.map((control) => (
              <label className="glitter-lab__control" key={control.key}>
                <span className="glitter-lab__label-row">
                  <span>{control.label}</span>
                  <output htmlFor={`glitter-${control.key}`}>
                    {settings[control.key].toFixed(2)}
                  </output>
                </span>
                <input
                  id={`glitter-${control.key}`}
                  data-testid={`control-${control.key}`}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={settings[control.key]}
                  onChange={(event) => updateSetting(control.key, Number(event.target.value))}
                />
              </label>
            ))}
          </div>

          <div className="glitter-lab__actions">
            <button type="button" onClick={() => onChange({ ...DEFAULT_GLITTER_SETTINGS })}>
              恢复默认
            </button>
            <button type="button" onClick={handleCopy}>
              {copyStatus === 'copied'
                ? '已复制'
                : copyStatus === 'failed'
                  ? '复制失败'
                  : '复制当前参数'}
            </button>
          </div>
        </div>
      </details>
    </aside>
  )
}
