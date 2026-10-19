import { expect, test, type Page } from '@playwright/test'

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

async function countBrightPixelsInScreenshot(page: Page, png: Buffer): Promise<number> {
  return page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()

    const sample = document.createElement('canvas')
    sample.width = image.naturalWidth
    sample.height = image.naturalHeight
    const context = sample.getContext('2d', { willReadFrequently: true })
    if (!context) return -1

    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data
    let brightPixels = 0
    for (let index = 0; index < pixels.length; index += 16) {
      if (pixels[index] > 135 && pixels[index + 1] > 135 && pixels[index + 2] > 135) {
        brightPixels += 1
      }
    }
    return brightPixels
  }, png.toString('base64'))
}

async function measureBrightPixelsInScreenshot(
  page: Page,
  png: Buffer,
): Promise<{ count: number; centroidX: number }> {
  return page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()

    const sample = document.createElement('canvas')
    sample.width = image.naturalWidth
    sample.height = image.naturalHeight
    const context = sample.getContext('2d', { willReadFrequently: true })
    if (!context) return { count: -1, centroidX: -1 }

    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data
    let count = 0
    let xTotal = 0
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] > 135 && pixels[index + 1] > 135 && pixels[index + 2] > 135) {
        count += 1
        xTotal += (index / 4) % sample.width
      }
    }
    return { count, centroidX: count > 0 ? xTotal / count : -1 }
  }, png.toString('base64'))
}

async function countChangedPixelsBetweenScreenshots(
  page: Page,
  firstPng: Buffer,
  secondPng: Buffer,
): Promise<number> {
  return page.evaluate(
    async ({ first, second }) => {
      const decode = async (base64: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        const sample = document.createElement('canvas')
        sample.width = image.naturalWidth
        sample.height = image.naturalHeight
        const context = sample.getContext('2d', { willReadFrequently: true })
        if (!context) return new Uint8ClampedArray()
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, sample.width, sample.height).data
      }

      const firstPixels = await decode(first)
      const secondPixels = await decode(second)
      let changedPixels = 0
      for (let index = 0; index < firstPixels.length; index += 16) {
        const delta =
          Math.abs(firstPixels[index] - secondPixels[index]) +
          Math.abs(firstPixels[index + 1] - secondPixels[index + 1]) +
          Math.abs(firstPixels[index + 2] - secondPixels[index + 2])
        if (delta > 18) changedPixels += 1
      }
      return changedPixels
    },
    { first: firstPng.toString('base64'), second: secondPng.toString('base64') },
  )
}

test('ambient music is opt-in, fades smoothly, pauses, and resumes in place', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto('/')
  const engine = page.getByTestId('ambient-audio-engine')
  const interactionEngine = page.getByTestId('interaction-audio-engine')
  const musicToggle = page.getByRole('button', { name: '开启声音' })

  await expect(musicToggle).toHaveAttribute('aria-pressed', 'false')
  await expect(engine).toHaveAttribute('data-context-state', 'uninitialized')
  await expect(interactionEngine).toHaveAttribute('data-enabled', 'false')

  await musicToggle.click()
  const playingToggle = page.getByRole('button', { name: '关闭声音' })
  await expect(playingToggle).toHaveAttribute(
    'data-state',
    'fading-in',
    { timeout: 10_000 },
  )
  await expect(engine).toHaveAttribute('data-context-state', 'running')
  await expect(interactionEngine).toHaveAttribute('data-enabled', 'true')
  await expect(engine).toHaveAttribute('data-channels', '2')
  await expect(engine).toHaveAttribute('data-sample-rate', '44100')
  await page.waitForTimeout(2_300)
  await expect(playingToggle).toHaveAttribute('data-state', 'on')

  await playingToggle.click()
  await expect(page.getByRole('button', { name: '开启声音' })).toHaveAttribute(
    'data-state',
    'fading-out',
  )
  await expect(interactionEngine).toHaveAttribute('data-enabled', 'false')
  await page.waitForTimeout(2_100)
  await expect(engine).toHaveAttribute('data-context-state', 'suspended')
  const pausedOffset = Number(await engine.getAttribute('data-offset'))
  expect(pausedOffset).toBeGreaterThan(2)

  await page.getByRole('button', { name: '开启声音' }).click()
  await expect(page.getByRole('button', { name: '关闭声音' })).toHaveAttribute(
    'data-state',
    'fading-in',
  )
  await expect(engine).toHaveAttribute('data-context-state', 'running')
  await expect(interactionEngine).toHaveAttribute('data-enabled', 'true')
  expect(Number(await engine.getAttribute('data-offset'))).toBeCloseTo(pausedOffset, 2)
})

test('the original ambient asset downloads and decodes in a real browser', async ({ page }) => {
  test.setTimeout(15_000)
  await page.goto('/')
  const engine = page.getByTestId('ambient-audio-engine')
  const decoded = await engine.evaluate(async (element) => {
    const source = (element as HTMLElement).dataset.source
    if (!source) throw new Error('Missing audio source')
    const response = await fetch(source)
    const bytes = await response.arrayBuffer()
    const byteLength = bytes.byteLength
    const context = new AudioContext()
    const buffer = await context.decodeAudioData(bytes)
    await context.close()
    return {
      byteLength,
      channels: buffer.numberOfChannels,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    }
  })

  expect(decoded.byteLength).toBeGreaterThan(4_000_000)
  expect(decoded.channels).toBe(2)
  expect(decoded.duration).toBeGreaterThan(124)
  expect(decoded.duration).toBeLessThan(126)
  expect(decoded.sampleRate).toBe(44_100)
  await expect(engine).toHaveAttribute('data-loop', 'true')
})

test('an audio load failure leaves the visual artwork running', async ({ page }) => {
  const errors = collectRuntimeErrors(page)
  await page.route('**/audio/one-thousand-glimmers.mp3', (route) => route.abort())
  await page.goto('/')
  const canvas = page.locator('canvas[data-renderer="ready"]')

  await page.getByRole('button', { name: '开启声音' }).click()
  await expect(page.getByRole('button', { name: '声音无法加载，点击重试' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('背景音乐加载失败')
  await expect(canvas).toBeVisible()
  expect(errors).toHaveLength(1)
  expect(errors[0]).toContain('Failed to load resource')
})

test('renders the normal artwork with Glitter Lab hidden', async ({ page }) => {
  const errors = collectRuntimeErrors(page)

  await page.goto('/')
  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(canvas).toBeVisible()
  await expect(page.getByLabel('Glitter Lab 开发面板')).toHaveCount(0)

  const box = await canvas.boundingBox()
  expect(box?.width).toBe(1440)
  expect(box?.height).toBe(900)

  await page.waitForTimeout(1_700)
  const phase4Default = await page.screenshot({
    path: 'artifacts/screenshots/phase-4-default.png',
    fullPage: true,
  })
  await page.waitForTimeout(850)
  const phase4Later = await page.screenshot({
    path: 'artifacts/screenshots/phase-4-later.png',
    fullPage: true,
  })
  await page.screenshot({
    path: 'artifacts/screenshots/phase-4-glow-detail.png',
    clip: { x: 500, y: 170, width: 560, height: 560 },
  })
  const autonomousChangedPixels = await countChangedPixelsBetweenScreenshots(
    page,
    phase4Default,
    phase4Later,
  )
  expect(autonomousChangedPixels).toBeGreaterThan(100)

  const qualityTelemetry = await canvas.evaluate((element) => {
    const htmlCanvas = element as HTMLCanvasElement
    return {
      averageFps: Number(htmlCanvas.dataset.averageFps ?? 0),
      cssWidth: htmlCanvas.clientWidth,
      drawingWidth: htmlCanvas.width,
      pixelRatio: Number(htmlCanvas.dataset.pixelRatio),
      tier: htmlCanvas.dataset.qualityTier,
    }
  })
  expect(qualityTelemetry.pixelRatio).toBeGreaterThanOrEqual(1)
  expect(qualityTelemetry.pixelRatio).toBeLessThanOrEqual(1.75)
  expect(qualityTelemetry.drawingWidth).toBeLessThanOrEqual(qualityTelemetry.cssWidth * 1.75)
  expect(qualityTelemetry.averageFps).toBeGreaterThan(0)
  expect(['full', 'balanced', 'reduced']).toContain(qualityTelemetry.tier)
  const webglError = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl2')
    return context?.getError()
  })
  expect(webglError).toBe(0)
  expect(errors).toEqual([])
})

test('Glitter Lab updates the rendered pixels, exports JSON, and resets', async ({ page }) => {
  test.setTimeout(180_000)
  const errors = collectRuntimeErrors(page)

  await page.goto('/?debug=true')
  const panel = page.getByLabel('Glitter Lab 开发面板')
  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(panel).toBeVisible()
  await expect(panel.locator('input[type="range"]')).toHaveCount(16)
  await expect(page.getByTestId('control-flickerSpeed')).toHaveAttribute('max', '10')
  await expect(page.getByTestId('control-sunElevation')).toHaveValue('24')
  await expect(page.getByTestId('control-sunAzimuth')).toHaveValue('28')
  await expect(page.getByTestId('control-sunIntensity')).toHaveValue('1')

  await page.getByTestId('control-waveStrength').fill('0')
  const measureCadence = async () => {
    let previous = await page.screenshot({ clip: { x: 520, y: 180, width: 500, height: 500 } })
    let changedPixels = 0
    for (let sample = 0; sample < 4; sample += 1) {
      await page.waitForTimeout(180)
      const current = await page.screenshot({ clip: { x: 520, y: 180, width: 500, height: 500 } })
      changedPixels += await countChangedPixelsBetweenScreenshots(page, previous, current)
      previous = current
    }
    return changedPixels
  }

  await page.getByTestId('control-flickerSpeed').fill('0.1')
  await page.waitForTimeout(300)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const slowChangedPixels = await measureCadence()
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })

  await page.getByTestId('control-flickerSpeed').fill('10')
  await page.waitForTimeout(300)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const fastChangedPixels = await measureCadence()
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })

  expect(fastChangedPixels).toBeGreaterThan(slowChangedPixels * 1.25)

  await panel.getByRole('button', { name: '恢复默认' }).click()

  await page.waitForTimeout(900)
  await page.screenshot({
    path: 'artifacts/screenshots/phase-2-default.png',
    fullPage: true,
  })

  await page.getByTestId('control-flickerSpeed').fill('0.1')
  await page.getByTestId('control-sunAzimuth').fill('-55')
  await page.waitForTimeout(240)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const leftSunScreenshot = await page.screenshot({
    path: 'artifacts/screenshots/phase-2-azimuth-left.png',
  })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })

  await page.getByTestId('control-sunAzimuth').fill('55')
  await page.waitForTimeout(240)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const rightSunScreenshot = await page.screenshot({
    path: 'artifacts/screenshots/phase-2-azimuth-right.png',
  })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })

  const leftSun = await measureBrightPixelsInScreenshot(page, leftSunScreenshot)
  const rightSun = await measureBrightPixelsInScreenshot(page, rightSunScreenshot)
  expect(rightSun.centroidX).toBeGreaterThan(leftSun.centroidX + 120)

  await page.getByTestId('control-sunAzimuth').fill('28')
  await page.getByTestId('control-sunElevation').fill('8')
  await page.waitForTimeout(180)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const lowSun = await page.screenshot({ clip: { x: 300, y: 80, width: 700, height: 740 } })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  await page.getByTestId('control-sunElevation').fill('70')
  await page.waitForTimeout(180)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const highSun = await page.screenshot({ clip: { x: 300, y: 80, width: 700, height: 740 } })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  const elevationChangedPixels = await countChangedPixelsBetweenScreenshots(page, lowSun, highSun)
  expect(elevationChangedPixels).toBeGreaterThan(500)

  await page.getByTestId('control-sunElevation').fill('24')
  await page.getByTestId('control-sunIntensity').fill('0.2')
  await page.waitForTimeout(180)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const dimSunScreenshot = await page.screenshot({ clip: { x: 300, y: 80, width: 700, height: 740 } })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  await page.getByTestId('control-sunIntensity').fill('2')
  await page.waitForTimeout(180)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const brightSunScreenshot = await page.screenshot({ clip: { x: 300, y: 80, width: 700, height: 740 } })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  const dimSun = await measureBrightPixelsInScreenshot(page, dimSunScreenshot)
  const brightSun = await measureBrightPixelsInScreenshot(page, brightSunScreenshot)
  expect(brightSun.count).toBeGreaterThan(dimSun.count + 50)

  await panel.getByRole('button', { name: '恢复默认' }).click()

  await page.getByTestId('control-density').fill('2')
  await page.getByTestId('control-size').fill('2')
  await page.getByTestId('control-highlightIntensity').fill('3')
  await page.getByTestId('control-bloomIntensity').fill('1.5')
  await page.waitForTimeout(120)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const boostedScreenshot = await page.screenshot({
    path: 'test-results/glitter-lab-boosted.png',
  })
  const boostedBrightPixels = await countBrightPixelsInScreenshot(page, boostedScreenshot)
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  await page.getByTestId('control-highlightIntensity').fill('0')
  await page.waitForTimeout(120)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const mutedScreenshot = await page.screenshot({
    path: 'test-results/glitter-lab-muted.png',
  })
  const mutedBrightPixels = await countBrightPixelsInScreenshot(page, mutedScreenshot)
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  expect(boostedBrightPixels).toBeGreaterThan(mutedBrightPixels + 50)

  const exportedSettings = {
    density: 1.23,
    size: 1.65,
    flickerSpeed: 7.5,
    highlightIntensity: 2.65,
    clustering: 0,
    bloomIntensity: 0.66,
    waveStrength: 0.42,
    finePointRatio: 1.16,
    waterContrast: 1.6,
    reflectionBandWidth: 0.82,
    localCorrelation: 0.7,
    sunElevation: 62,
    sunAzimuth: -38,
    sunIntensity: 1.25,
    breezeStrength: 0.42,
    interactionSoundVolume: 0.1,
  }

  for (const [key, value] of Object.entries(exportedSettings)) {
    await page.getByTestId(`control-${key}`).fill(String(value))
  }
  await page.waitForTimeout(180)
  await page.screenshot({
    path: 'artifacts/screenshots/phase-2-high-sun.png',
    fullPage: true,
  })
  await page.screenshot({
    path: 'artifacts/screenshots/phase-2-high-sun-detail.png',
    clip: { x: 520, y: 150, width: 560, height: 560 },
  })

  await panel.getByRole('button', { name: '复制当前参数' }).click()
  await expect(panel.getByRole('button', { name: '已复制' })).toBeVisible()
  const clipboard = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
  expect(clipboard).toEqual(exportedSettings)

  await panel.getByRole('button', { name: '恢复默认' }).click()
  await expect(page.getByTestId('control-density')).toHaveValue('1.23')
  await expect(page.getByTestId('control-size')).toHaveValue('1.65')
  await expect(page.getByTestId('control-flickerSpeed')).toHaveValue('7.5')
  await expect(page.getByTestId('control-bloomIntensity')).toHaveValue('0.66')
  await expect(page.getByTestId('control-finePointRatio')).toHaveValue('1.16')
  await expect(page.getByTestId('control-reflectionBandWidth')).toHaveValue('0.82')
  await expect(page.getByTestId('control-sunElevation')).toHaveValue('24')
  await expect(page.getByTestId('control-sunAzimuth')).toHaveValue('28')
  await expect(page.getByTestId('control-sunIntensity')).toHaveValue('1')
  await expect(page.getByTestId('control-breezeStrength')).toHaveValue('0.42')
  await expect(page.getByTestId('control-interactionSoundVolume')).toHaveValue('0.1')

  await panel.locator('summary').click()
  await expect(panel.getByText('实时视觉参数')).toBeHidden()
  await panel.locator('summary').click()
  await expect(panel.getByText('实时视觉参数')).toBeVisible()

  const webglError = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl2')
    return context?.getError()
  })
  expect(webglError).toBe(0)
  expect(errors).toEqual([])
})

test('pointer breeze mechanism stays bounded, local, and fades after movement stops', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = collectRuntimeErrors(page)
  const requestedEffects: string[] = []
  page.on('request', (request) => {
    if (/glimmer-(?:click|drag)\.wav(?:\?|$)/.test(request.url())) {
      requestedEffects.push(request.url())
    }
  })

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?debug=true')
  const panel = page.getByLabel('Glitter Lab 开发面板')
  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(canvas).toBeVisible()
  await expect(page.getByTestId('control-breezeStrength')).toBeVisible()

  await page.getByTestId('control-flickerSpeed').fill('0.1')
  await expect(page.getByTestId('control-waveStrength')).toHaveValue('0.42')
  await expect(page.getByTestId('control-breezeStrength')).toHaveValue('0.42')
  const interactionAudio = page.getByTestId('interaction-audio-engine')
  await expect(interactionAudio).toHaveAttribute('data-click-source', '/audio/glimmer-click.wav')
  await expect(interactionAudio).toHaveAttribute('data-drag-source', '/audio/glimmer-drag.wav')
  await expect(interactionAudio).toHaveAttribute('data-volume', '0.10')
  await expect(interactionAudio).toHaveAttribute('data-enabled', 'false')
  await expect(interactionAudio).toHaveAttribute('data-play-count', '0')
  await page.getByTestId('control-interactionSoundVolume').fill('0.04')
  await expect(interactionAudio).toHaveAttribute('data-volume', '0.04')
  await page.getByTestId('control-interactionSoundVolume').fill('0.1')
  await expect(interactionAudio).toHaveAttribute('data-volume', '0.10')
  expect(requestedEffects).toEqual([])
  const decodedEffects = await interactionAudio.evaluate(async (element) => {
    const clickSource = element.getAttribute('data-click-source') ?? ''
    const dragSource = element.getAttribute('data-drag-source') ?? ''
    const context = new AudioContext()
    const decode = async (source: string) => {
      const response = await fetch(source)
      const bytes = await response.arrayBuffer()
      const buffer = await context.decodeAudioData(bytes)
      return {
        channels: buffer.numberOfChannels,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
      }
    }
    const [click, drag] = await Promise.all([decode(clickSource), decode(dragSource)])
    await context.close()
    return { click, drag }
  })
  expect(decodedEffects.click.channels).toBe(2)
  expect(decodedEffects.click.sampleRate).toBe(44_100)
  expect(decodedEffects.click.duration).toBeGreaterThan(2.4)
  expect(decodedEffects.click.duration).toBeLessThan(2.6)
  expect(decodedEffects.drag.channels).toBe(2)
  expect(decodedEffects.drag.sampleRate).toBe(44_100)
  expect(decodedEffects.drag.duration).toBeGreaterThan(3.9)
  expect(decodedEffects.drag.duration).toBeLessThan(4.1)
  const requestsBeforeMutedEvent = requestedEffects.length
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('one-thousand-glimmers:interaction-sound', { detail: 'click' }),
    )
  })
  await page.waitForTimeout(120)
  await expect(interactionAudio).toHaveAttribute('data-play-count', '0')
  expect(requestedEffects).toHaveLength(requestsBeforeMutedEvent)

  const soundToggle = page.locator('.ambient-audio__toggle')
  await soundToggle.click()
  await expect(interactionAudio).toHaveAttribute('data-enabled', 'true')
  await page.evaluate(() => {
    const eventName = 'one-thousand-glimmers:interaction-sound'
    const eventLog: string[] = []
    ;(window as unknown as { __interactionSoundEvents: string[] }).__interactionSoundEvents = eventLog
    window.addEventListener(eventName, (event) => {
      eventLog.push((event as CustomEvent<string>).detail)
    })
  })
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })

  await page.mouse.move(220, 450)
  await page.waitForTimeout(180)
  const idleScreenshot = await page.screenshot({
    path: 'artifacts/screenshots/phase-3-breeze-idle.png',
  })

  // Exercise a quiet-water area so the standalone click response cannot hide
  // inside the already-active reflection band.
  await page.mouse.move(360, 450)
  await page.mouse.down()
  await page.waitForTimeout(240)
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  )
  const clickState = await canvas.evaluate((element) => {
    const artwork = element as HTMLCanvasElement & {
      __pointerClickInfluence?: number
      __pointerDragInfluence?: number
    }
    return {
      click: artwork.__pointerClickInfluence ?? 0,
      drag: artwork.__pointerDragInfluence ?? 0,
    }
  })
  const clickScreenshot = await page.screenshot({
    path: 'artifacts/screenshots/pointer-click-active.png',
  })
  await page.mouse.up()
  await expect(interactionAudio).toHaveAttribute('data-master-volume', '0.10')
  await expect(interactionAudio).toHaveAttribute('data-play-count', '1')
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  await page.getByTestId('control-interactionSoundVolume').fill('0.04')
  await expect(interactionAudio).toHaveAttribute('data-master-volume', '0.04')
  await page.getByTestId('control-interactionSoundVolume').fill('0.1')
  await expect(interactionAudio).toHaveAttribute('data-master-volume', '0.10')
  await soundToggle.click()
  await expect(interactionAudio).toHaveAttribute('data-enabled', 'false')
  await expect(interactionAudio).toHaveAttribute('data-master-volume', '0.00')
  await expect(interactionAudio).toHaveAttribute('data-play-count', '1')
  await soundToggle.click()
  await expect(interactionAudio).toHaveAttribute('data-enabled', 'true')
  await expect(interactionAudio).toHaveAttribute('data-master-volume', '0.10')
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  expect(clickState.click).toBeGreaterThan(0.75)
  expect(clickState.drag).toBeLessThan(0.03)
  expect(
    await countChangedPixelsBetweenScreenshots(page, idleScreenshot, clickScreenshot),
  ).toBeGreaterThan(80)

  await page.waitForTimeout(1_600)
  const recoveredClick = await canvas.evaluate(
    (element) =>
      (element as HTMLCanvasElement & { __pointerClickInfluence?: number })
        .__pointerClickInfluence ?? 0,
  )
  expect(recoveredClick).toBeLessThan(0.03)

  await page.mouse.move(540, 450)
  await page.mouse.down()
  await page.mouse.move(760, 450, { steps: 5 })
  await page.waitForTimeout(220)
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  )
  const activeInfluence = await canvas.evaluate((element) => {
    const artwork = element as HTMLCanvasElement & {
      __pointerDragInfluence?: number
    }
    return artwork.__pointerDragInfluence ?? 0
  })
  const activeScreenshot = await page.screenshot({
    path: 'artifacts/screenshots/phase-3-breeze-active.png',
  })
  await page.mouse.up()
  expect(activeInfluence).toBeGreaterThan(0.2)
  expect(activeInfluence).toBeLessThanOrEqual(1)

  const activeChangedPixels = await countChangedPixelsBetweenScreenshots(
    page,
    idleScreenshot,
    activeScreenshot,
  )
  expect(activeChangedPixels).toBeGreaterThan(100)

  const soundEvents = await page.evaluate(
    () =>
      (window as unknown as { __interactionSoundEvents: string[] }).__interactionSoundEvents,
  )
  expect(soundEvents.filter((kind) => kind === 'click')).toHaveLength(2)
  expect(soundEvents.filter((kind) => kind === 'drag')).toHaveLength(1)
  expect(requestedEffects.filter((url) => /glimmer-click\.wav(?:\?|$)/.test(url))).toHaveLength(2)
  expect(requestedEffects.filter((url) => /glimmer-drag\.wav(?:\?|$)/.test(url))).toHaveLength(2)

  await page.waitForTimeout(2_200)
  const recoveredInfluence = await canvas.evaluate((element) => {
    const artwork = element as HTMLCanvasElement & {
      __pointerClickInfluence?: number
      __pointerDragInfluence?: number
    }
    return Math.max(
      artwork.__pointerClickInfluence ?? 0,
      artwork.__pointerDragInfluence ?? 0,
    )
  })
  await page.screenshot({ path: 'artifacts/screenshots/phase-3-breeze-recovered.png' })
  expect(recoveredInfluence).toBeLessThan(0.03)

  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })
  await page.getByTestId('control-waveStrength').fill('0')
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  await page.waitForTimeout(240)
  const decoupledClip = { x: 600, y: 250, width: 520, height: 360 }
  const calmWater = await page.screenshot({ clip: decoupledClip })
  await page.mouse.move(760, 430)
  await page.mouse.down()
  await page.mouse.move(920, 430, { steps: 4 })
  await page.waitForTimeout(220)
  await page.mouse.up()
  await page.waitForTimeout(60)
  const breezeWithoutAutonomousWaves = await page.screenshot({ clip: decoupledClip })
  const decoupledChangedPixels = await countChangedPixelsBetweenScreenshots(
    page,
    calmWater,
    breezeWithoutAutonomousWaves,
  )
  expect(decoupledChangedPixels).toBeGreaterThan(50)

  const webglError = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl2')
    return context?.getError()
  })
  expect(webglError).toBe(0)
  expect(errors).toEqual([])
})
