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

  test('is visible on / and exposes primary nav', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: /hangar 1000/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^status$/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^users$/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(
      nav.getByRole('link', { name: /create account/i }),
    ).toBeVisible()
  })

  test('navigates to /admin/users when Users is clicked', async ({ page }) => {
    await page.route('**/api/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )

    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await nav.getByRole('link', { name: /^users$/i }).click()

    await page.waitForURL('**/admin/users')
    await expect(
      page.getByRole('heading', { name: /registered users/i }),
    ).toBeVisible()
  })

  test('renders on /login as well', async ({ page }) => {
    await page.goto('/login')

    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: /hangar 1000/i })).toBeVisible()
  })
})
