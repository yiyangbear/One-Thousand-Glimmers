import { expect, test } from '@playwright/test'

test('renders a full-screen WebGL river without runtime errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  const canvas = page.locator('canvas[data-renderer="ready"]')
  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('data-renderer', 'ready')

  const box = await canvas.boundingBox()
  expect(box?.width).toBe(1440)
  expect(box?.height).toBe(900)

  await page.waitForTimeout(1_500)
  const webglError = await canvas.evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl2')
    return context?.getError()
  })
  expect(webglError).toBe(0)
  expect(errors).toEqual([])
  await page.screenshot({
    path: 'artifacts/screenshots/phase-1-normal.png',
    fullPage: true,
  })

  await page.waitForTimeout(1_800)
  await page.screenshot({
    path: 'artifacts/screenshots/phase-1-later.png',
    fullPage: true,
  })
})
