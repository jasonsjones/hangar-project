import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UserListPage } from './UserListPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/users']}>
      <UserListPage />
    </MemoryRouter>,
  )
}

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

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

function mockListResponse(users: typeof SAMPLE_USERS) {
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('UserListPage', () => {
  it('shows a loading state then renders the list of users', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      mockListResponse(SAMPLE_USERS),
    )
    renderPage()

    expect(screen.getByText(/loading users/i)).toBeInTheDocument()
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('alan@example.com')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^delete$/i })).toHaveLength(2)
  })

  it('shows an empty-state message when there are no users', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockListResponse([]))
    renderPage()
    expect(
      await screen.findByText(/no users have registered yet/i),
    ).toBeInTheDocument()
  })

  it('shows an error and retries fetching', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    fetchMock.mockResolvedValueOnce(mockListResponse(SAMPLE_USERS))

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText(/unable to load users/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('shows a network error when the fetch rejects', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('boom'))
    renderPage()
    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })

  it('deletes a user after confirmation and removes the row', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValueOnce(mockListResponse(SAMPLE_USERS))
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    const user = userEvent.setup()
    renderPage()

    const adaRow = (await screen.findByText('Ada Lovelace')).closest('tr')!
    await user.click(within(adaRow).getByRole('button', { name: /^delete$/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/delete user\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    // Wait for the row to disappear.
    expect(
      await screen.findByText('Alan Turing'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()

    const [, deleteCall] = fetchMock.mock.calls
    expect(deleteCall[0]).toBe(
      '/api/users/00000000-0000-0000-0000-000000000001',
    )
    expect((deleteCall[1] as RequestInit | undefined)?.method).toBe('DELETE')
  })

  it('cancels the delete confirmation without calling the API', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValueOnce(mockListResponse(SAMPLE_USERS))

    const user = userEvent.setup()
    renderPage()

    const adaRow = (await screen.findByText('Ada Lovelace')).closest('tr')!
    await user.click(within(adaRow).getByRole('button', { name: /^delete$/i }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('shows an inline error when delete fails', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValueOnce(mockListResponse(SAMPLE_USERS))
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))

    const user = userEvent.setup()
    renderPage()

    const adaRow = (await screen.findByText('Ada Lovelace')).closest('tr')!
    await user.click(within(adaRow).getByRole('button', { name: /^delete$/i }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(
      await screen.findByText(/unable to delete user/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })
})
