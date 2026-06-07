import { expect, test } from '@playwright/test'

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/status', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      }),
    )
  })

  test('is visible on / and exposes brand + auth slot', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: /hangar 1000/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /log in/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /register/i })).toBeVisible()
  })

  test('brand link returns home from another route', async ({ page }) => {
    await page.goto('/login')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await nav.getByRole('link', { name: /hangar 1000/i }).click()

    await page.waitForURL('**/')
    await expect(
      page.getByRole('heading', { name: /welcome to hangar 1000/i }),
    ).toBeVisible()
  })

  test('renders on /login as well', async ({ page }) => {
    await page.goto('/login')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: /hangar 1000/i })).toBeVisible()
  })
})
