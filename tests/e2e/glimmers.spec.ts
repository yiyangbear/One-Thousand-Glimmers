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

test('renders the normal artwork with Glitter Lab hidden', async ({ page }) => {
  const errors = collectRuntimeErrors(page)

  await page.goto('/')
  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(canvas).toBeVisible()
  await expect(page.getByLabel('Glitter Lab 开发面板')).toHaveCount(0)

  const box = await canvas.boundingBox()
  expect(box?.width).toBe(1440)
  expect(box?.height).toBe(900)

  await page.waitForTimeout(800)
  const webglError = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl2')
    return context?.getError()
  })
  expect(webglError).toBe(0)
  expect(errors).toEqual([])
})

test('Glitter Lab updates the rendered pixels, exports JSON, and resets', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = collectRuntimeErrors(page)

  await page.goto('/?debug=true')
  const panel = page.getByLabel('Glitter Lab 开发面板')
  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(panel).toBeVisible()
  await expect(panel.locator('input[type="range"]')).toHaveCount(11)
  await expect(page.getByTestId('control-flickerSpeed')).toHaveAttribute('max', '6')
  await expect(panel.getByText('未实现 · Phase 3')).toBeVisible()

  await page.getByTestId('control-waveStrength').fill('0')
  await page.getByTestId('control-flickerSpeed').fill('0.1')
  await page.waitForTimeout(300)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const slowStart = await page.screenshot({ clip: { x: 520, y: 180, width: 500, height: 500 } })
  await page.waitForTimeout(350)
  const slowEnd = await page.screenshot({ clip: { x: 520, y: 180, width: 500, height: 500 } })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })

  await page.getByTestId('control-flickerSpeed').fill('6')
  await page.waitForTimeout(300)
  await panel.evaluate((element) => {
    element.style.visibility = 'hidden'
  })
  const fastStart = await page.screenshot({ clip: { x: 520, y: 180, width: 500, height: 500 } })
  await page.waitForTimeout(350)
  const fastEnd = await page.screenshot({ clip: { x: 520, y: 180, width: 500, height: 500 } })
  await panel.evaluate((element) => {
    element.style.visibility = 'visible'
  })

  const slowChangedPixels = await countChangedPixelsBetweenScreenshots(page, slowStart, slowEnd)
  const fastChangedPixels = await countChangedPixelsBetweenScreenshots(page, fastStart, fastEnd)
  expect(fastChangedPixels).toBeGreaterThan(slowChangedPixels * 1.5)

  await panel.getByRole('button', { name: '恢复默认' }).click()

  await page.waitForTimeout(900)
  await page.screenshot({
    path: 'artifacts/screenshots/glint-cadence-default.png',
    fullPage: true,
  })

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
    density: 0.61,
    size: 1.65,
    flickerSpeed: 4.8,
    highlightIntensity: 2.53,
    clustering: 0,
    bloomIntensity: 0.34,
    waveStrength: 0.36,
    finePointRatio: 0.96,
    waterContrast: 1.6,
    reflectionBandWidth: 0.76,
    localCorrelation: 0.7,
  }

  for (const [key, value] of Object.entries(exportedSettings)) {
    await page.getByTestId(`control-${key}`).fill(String(value))
  }
  await page.waitForTimeout(180)
  await page.screenshot({
    path: 'artifacts/screenshots/glint-cadence-fast.png',
    fullPage: true,
  })
  await page.screenshot({
    path: 'artifacts/screenshots/glint-cadence-detail.png',
    clip: { x: 520, y: 150, width: 560, height: 560 },
  })

  await panel.getByRole('button', { name: '复制当前参数' }).click()
  await expect(panel.getByRole('button', { name: '已复制' })).toBeVisible()
  const clipboard = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
  expect(clipboard).toEqual(exportedSettings)

  await panel.getByRole('button', { name: '恢复默认' }).click()
  await expect(page.getByTestId('control-density')).toHaveValue('0.61')
  await expect(page.getByTestId('control-size')).toHaveValue('1.65')
  await expect(page.getByTestId('control-flickerSpeed')).toHaveValue('3')
  await expect(page.getByTestId('control-bloomIntensity')).toHaveValue('0.34')
  await expect(page.getByTestId('control-finePointRatio')).toHaveValue('0.96')
  await expect(page.getByTestId('control-reflectionBandWidth')).toHaveValue('0.76')

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
