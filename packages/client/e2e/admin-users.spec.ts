import { expect, test } from '@playwright/test'

const SAMPLE_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    createdAt: '2024-03-14T10:15:00',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'alan@example.com',
    firstName: 'Alan',
    lastName: 'Turing',
    createdAt: '2024-04-01T09:00:00',
  },
]

// Seeds a logged-in session before the app boots, so the RequireAuth guard lets
// us reach /admin/users. addInitScript runs before any page script, so the token
// is already in localStorage when AuthProvider reads it on mount.
//
// The signed-in admin is deliberately someone NOT in SAMPLE_USERS (Grace Hopper),
// because the Navbar renders the logged-in user's name. If we reused a name from
// the table, getByText() would match both the navbar greeting and a table row and
// trip Playwright's strict-mode (multiple matches) check.
async function seedSession(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hangar.auth.token', 'e2e.jwt.token')
    localStorage.setItem(
      'hangar.auth.user',
      JSON.stringify({
        id: '00000000-0000-0000-0000-000000000099',
        email: 'grace@example.com',
        firstName: 'Grace',
        lastName: 'Hopper',
      }),
    )
  })
}

test.describe('Admin users page', () => {
  test('redirects to /login when not authenticated', async ({ page }) => {
    // No seeded session — the guard should bounce us before any list renders.
    await page.goto('/admin/users')

    await page.waitForURL('**/login')
    await expect(
      page.getByRole('heading', { name: /^log in$/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /registered users/i }),
    ).toHaveCount(0)
  })

  test('lists all registered users', async ({ page }) => {
    await seedSession(page)
    await page.route('**/api/users', (route) => {
      // The list request carries the seeded bearer token.
      expect(route.request().headers()['authorization']).toBe(
        'Bearer e2e.jwt.token',
      )
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SAMPLE_USERS),
      })
    })

    await page.goto('/admin/users')

    await expect(
      page.getByRole('heading', { name: /registered users/i }),
    ).toBeVisible()
    await expect(page.getByText('Ada Lovelace')).toBeVisible()
    await expect(page.getByText('alan@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: /^delete$/i })).toHaveCount(2)
  })

  test('shows the empty state when no users are registered', async ({ page }) => {
    await seedSession(page)
    await page.route('**/api/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )

    await page.goto('/admin/users')

    await expect(
      page.getByText(/no users have registered yet/i),
    ).toBeVisible()
  })

  test('deletes a user after confirmation', async ({ page }) => {
    await seedSession(page)
    let users = [...SAMPLE_USERS]

    await page.route('**/api/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(users),
      }),
    )
    await page.route('**/api/users/*', async (route) => {
      const request = route.request()
      expect(request.method()).toBe('DELETE')
      const url = new URL(request.url())
      const id = url.pathname.split('/').pop()
      users = users.filter((u) => u.id !== id)
      await route.fulfill({ status: 204, body: '' })
    })

    await page.goto('/admin/users')

    const adaRow = page.getByRole('row', { name: /ada lovelace/i })
    await expect(adaRow).toBeVisible()
    await adaRow.getByRole('button', { name: /^delete$/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(/delete user\?/i)).toBeVisible()
    await dialog.getByRole('button', { name: /^delete$/i }).click()

    await expect(page.getByText('Ada Lovelace')).toHaveCount(0)
    await expect(page.getByText('Alan Turing')).toBeVisible()
  })
})
