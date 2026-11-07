import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import ContentDetail from './ContentDetail'

const content = {
  id: 1,
  title: '坊ちゃん',
  body: '親譲りの無鉄砲で\n小供の時から損ばかりしている。',
  createdAt: '2022-06-02T00:00:00.000Z',
  updatedAt: '2022-06-02T00:00:00.000Z',
}

const mockFetch = (response: Response) => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
}

describe('ContentDetail', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('タイトルと本文を表示する', async () => {
    mockFetch(Response.json(content))

    renderWithProviders(<ContentDetail id={1} />)

    expect(
      await screen.findByRole('heading', { name: '坊ちゃん' }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: '本文' })).toHaveTextContent(
      '親譲りの無鉄砲で',
    )
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    mockFetch(new Response('', { status: 500 }))

    renderWithProviders(<ContentDetail id={1} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ページの取得に失敗しました',
    )
  })

  it('API が空のレスポンスを返した場合は見つからない旨を表示する', async () => {
    mockFetch(new Response(''))

    renderWithProviders(<ContentDetail id={1} />)

    expect(await screen.findByText('ページが見つかりません')).toBeVisible()
  })

  it('タイトルと本文を同時に編集できる', async () => {
    mockFetch(Response.json(content))
    renderWithProviders(<ContentDetail id={1} />)

    await userEvent.click(
      within(await screen.findByRole('region', { name: 'タイトル' })).getByRole(
        'button',
        { name: 'Edit' },
      ),
    )
    await userEvent.click(
      within(screen.getByRole('region', { name: '本文' })).getByRole('button', {
        name: 'Edit',
      }),
    )

    expect(screen.getByRole('textbox', { name: 'タイトル' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: '本文' })).toBeVisible()
  })

  it('editTitle の指定があればタイトルだけ編集状態で開く', async () => {
    mockFetch(Response.json(content))

    renderWithProviders(<ContentDetail id={1} />, {
      route: { pathname: '/content/1', state: { editTitle: true } },
    })

    expect(
      await screen.findByRole('textbox', { name: 'タイトル' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('textbox', { name: '本文' }),
    ).not.toBeInTheDocument()
  })
})
