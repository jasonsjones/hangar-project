import { expect, test } from '@playwright/test'

test.describe('Register page', () => {
  test('shows validation errors for empty submission', async ({ page }) => {
    await page.goto('/register')

    await expect(
      page.getByRole('heading', { name: /create your account/i }),
    ).toBeVisible()

    await page.getByRole('button', { name: /^register$/i }).click()

    await expect(page.getByText(/first name is required/i)).toBeVisible()
    await expect(page.getByText(/last name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
  })

  test('shows an invalid-email error for malformed input', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel(/first name/i).fill('Ada')
    await page.getByLabel(/last name/i).fill('Lovelace')
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByRole('button', { name: /^register$/i }).click()

    await expect(
      page.getByText(/please enter a valid email address/i),
    ).toBeVisible()
  })

  test('successful registration shows confirmation and redirects home', async ({
    page,
  }) => {
    await page.route('**/api/users', async (route) => {
      const request = route.request()
      expect(request.method()).toBe('POST')
      const body = JSON.parse(request.postData() ?? '{}')
      expect(body).toEqual({
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
      })
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000001',
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
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

    await page.goto('/register')

    await page.getByLabel(/first name/i).fill('Ada')
    await page.getByLabel(/last name/i).fill('Lovelace')
    await page.getByLabel(/email/i).fill('ada@example.com')
    await page.getByRole('button', { name: /^register$/i }).click()

    await expect(page.getByText(/account created/i)).toBeVisible()
    await page.waitForURL('**/')
    await expect(
      page.getByRole('heading', { name: /welcome to hangar 1000/i }),
    ).toBeVisible()
  })

  test('shows duplicate-email error when server returns 409', async ({ page }) => {
    await page.route('**/api/users', (route) =>
      route.fulfill({ status: 409, body: '' }),
    )

    await page.goto('/register')

    await page.getByLabel(/first name/i).fill('Ada')
    await page.getByLabel(/last name/i).fill('Lovelace')
    await page.getByLabel(/email/i).fill('ada@example.com')
    await page.getByRole('button', { name: /^register$/i }).click()

    await expect(
      page.getByText(/account with that email already exists/i),
    ).toBeVisible()
  })
})
