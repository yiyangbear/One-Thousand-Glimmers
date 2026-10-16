import { expect, test, type Page } from '@playwright/test'

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test('@cross-browser renders a healthy WebGL artwork', async ({ page }) => {
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(canvas).toBeVisible()
  await expect(page.getByLabel('Glitter Lab 开发面板')).toHaveCount(0)
  const musicToggle = page.getByRole('button', { name: '开启背景音乐' })
  const audio = page.getByTestId('ambient-audio-element')
  await expect(musicToggle).toBeVisible()
  await expect(musicToggle).toHaveAttribute('aria-pressed', 'false')
  await expect(audio).toHaveJSProperty('paused', true)
  await expect(audio).toHaveJSProperty('loop', true)
  await page.waitForTimeout(1_800)

  const state = await canvas.evaluate((element) => {
    const htmlCanvas = element as HTMLCanvasElement
    const context = htmlCanvas.getContext('webgl2') ?? htmlCanvas.getContext('webgl')
    return {
      error: context?.getError(),
      height: htmlCanvas.clientHeight,
      pixelRatio: Number(htmlCanvas.dataset.pixelRatio),
      width: htmlCanvas.clientWidth,
    }
  })

  expect(state.width).toBeGreaterThan(0)
  expect(state.height).toBeGreaterThan(0)
  expect(state.pixelRatio).toBeGreaterThanOrEqual(1)
  expect(state.pixelRatio).toBeLessThanOrEqual(1.75)
  expect(state.error).toBe(0)
  expect(errors).toEqual([])
})

test('@cross-browser supports narrow and short debug layouts', async ({ page, browserName }) => {
  const errors = collectRuntimeErrors(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?debug=true')

  const canvas = page.locator('canvas[data-renderer="ready"]')
  const panel = page.getByLabel('Glitter Lab 开发面板')
  await expect(canvas).toBeVisible()
  await expect(panel).toBeVisible()
  await expect(canvas).toHaveCSS('width', '390px')
  await expect(canvas).toHaveCSS('height', '844px')

  const portraitBounds = await panel.boundingBox()
  expect(portraitBounds).not.toBeNull()
  expect(portraitBounds!.x).toBeGreaterThanOrEqual(0)
  expect(portraitBounds!.x + portraitBounds!.width).toBeLessThanOrEqual(390)

  const resetButton = panel.getByRole('button', { name: '恢复默认' })
  const copyButton = panel.getByRole('button', { name: '复制当前参数' })
  await resetButton.scrollIntoViewIfNeeded()
  await expect(resetButton).toBeVisible()
  await expect(copyButton).toBeVisible()

  if (browserName === 'chromium') {
    await page.screenshot({
      path: 'artifacts/screenshots/phase-5-mobile-debug.png',
      fullPage: true,
    })
  }

  await page.setViewportSize({ width: 844, height: 390 })
  await expect(canvas).toHaveCSS('width', '844px')
  await expect(canvas).toHaveCSS('height', '390px')
  const panelBody = panel.locator('.glitter-lab__body')
  const scrollState = await panelBody.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(scrollState.scrollHeight).toBeGreaterThan(scrollState.clientHeight)

  if (browserName === 'chromium') {
    await page.screenshot({
      path: 'artifacts/screenshots/phase-5-landscape-debug.png',
      fullPage: true,
    })
  }
  expect(errors).toEqual([])
})

test('Glitter Lab is keyboard operable and reduced motion is honored', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?debug=true')

  const canvas = page.locator('canvas[data-renderer="ready"]')
  const panel = page.getByLabel('Glitter Lab 开发面板')
  const summary = panel.locator('summary')
  await expect(canvas).toHaveAttribute('data-motion-rate', '0.35')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('main.artwork')).toHaveAttribute(
    'aria-label',
    '阳光在深蓝灰色江面上安静地明灭',
  )

  await summary.focus()
  await expect(summary).toBeFocused()
  await expect(summary).toHaveCSS('outline-style', 'solid')
  await summary.press('Enter')
  await expect(panel.getByText('实时视觉参数')).toBeHidden()
  await summary.press('Enter')
  await expect(panel.getByText('实时视觉参数')).toBeVisible()

  await expect(panel.locator('input[type="range"]')).toHaveCount(15)
  const labels = await panel.locator('label').allTextContents()
  expect(labels.every((label) => label.trim().length > 0)).toBe(true)
})

test('runs autonomously for sixty seconds without runtime or WebGL errors', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = collectRuntimeErrors(page)
  await page.goto('/')

  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(canvas).toBeVisible()
  await page.waitForTimeout(60_000)

  const state = await canvas.evaluate((element) => {
    const htmlCanvas = element as HTMLCanvasElement
    const context = htmlCanvas.getContext('webgl2') ?? htmlCanvas.getContext('webgl')
    return {
      averageFps: Number(htmlCanvas.dataset.averageFps ?? 0),
      error: context?.getError(),
      tier: htmlCanvas.dataset.qualityTier,
    }
  })
  await page.screenshot({ path: 'artifacts/screenshots/phase-5-soak-60s.png' })

  expect(state.averageFps).toBeGreaterThan(0)
  expect(['full', 'balanced', 'reduced']).toContain(state.tier)
  expect(state.error).toBe(0)
  expect(errors).toEqual([])
})
