import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import type { Content } from '@/features/content/types'
import ContentNav from './ContentNav'

const createContent = (overrides: Partial<Content>): Content => ({
  id: 1,
  title: 'タイトル',
  body: '本文',
  createdAt: '2022-06-02T00:00:00.000Z',
  updatedAt: '2022-06-02T00:00:00.000Z',
  ...overrides,
})

const mockFetch = (response: Response) => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
}

describe('ContentNav', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ページのタイトル一覧を ID 昇順で表示する', async () => {
    mockFetch(
      Response.json([
        createContent({ id: 2, title: '方丈記' }),
        createContent({ id: 1, title: '坊ちゃん' }),
      ]),
    )

    renderWithProviders(<ContentNav />)

    const links = await screen.findAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      '坊ちゃん',
      '方丈記',
    ])
    expect(links[0]).toHaveAttribute('href', '/content/1')
  })

  it('タイトルが null の場合は「無題」と表示する', async () => {
    mockFetch(Response.json([createContent({ title: null })]))

    renderWithProviders(<ContentNav />)

    expect(await screen.findByRole('link', { name: '無題' })).toBeVisible()
  })

  it('現在の URL のページを選択状態にする', async () => {
    mockFetch(
      Response.json([
        createContent({ id: 1, title: '坊ちゃん' }),
        createContent({ id: 2, title: '方丈記' }),
      ]),
    )

    renderWithProviders(<ContentNav />, { route: '/content/2' })

    expect(await screen.findByRole('link', { name: '方丈記' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: '坊ちゃん' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('ページが 0 件の場合はその旨を表示する', async () => {
    mockFetch(Response.json([]))

    renderWithProviders(<ContentNav />)

    expect(await screen.findByText('ページがありません')).toBeVisible()
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    mockFetch(new Response('', { status: 500 }))

    renderWithProviders(<ContentNav />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ページ一覧の取得に失敗しました',
    )
  })
})
