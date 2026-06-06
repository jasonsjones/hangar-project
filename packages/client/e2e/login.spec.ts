import { expect, test } from '@playwright/test'

test.describe('Login page', () => {
  test('shows validation errors for empty submission', async ({ page }) => {
    await page.goto('/login')

    await expect(
      page.getByRole('heading', { name: /^sign in$/i }),
    ).toBeVisible()

    await page.getByRole('button', { name: /^sign in$/i }).click()

    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('successful login shows confirmation and redirects home', async ({
    page,
  }) => {
    await page.route('**/api/auth/login', async (route) => {
      const request = route.request()
      expect(request.method()).toBe('POST')
      const body = JSON.parse(request.postData() ?? '{}')
      expect(body).toEqual({
        email: 'ada@example.com',
        password: 'correcthorse',
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          userId: '00000000-0000-0000-0000-000000000001',
          email: body.email,
          firstName: 'Ada',
          lastName: 'Lovelace',
        }),
      })
    })
    await page.route('**/api/status', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' }),
      }),
    )

    await page.goto('/login')

    await page.getByLabel(/email/i).fill('ada@example.com')
    await page.getByLabel(/password/i).fill('correcthorse')
    await page.getByRole('button', { name: /^sign in$/i }).click()

    await expect(page.getByText(/signed in/i)).toBeVisible()
    await page.waitForURL('**/')
    await expect(
      page.getByRole('heading', { name: /welcome to hangar 1000/i }),
    ).toBeVisible()
  })

  test('shows sanitized error and stays on /login when server returns 401', async ({
    page,
  }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 401, body: '' }),
    )

    await page.goto('/login')

    await page.getByLabel(/email/i).fill('ada@example.com')
    await page.getByLabel(/password/i).fill('wrongpw')
    await page.getByRole('button', { name: /^sign in$/i }).click()

    await expect(
      page.getByText(/email or password is incorrect/i),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
