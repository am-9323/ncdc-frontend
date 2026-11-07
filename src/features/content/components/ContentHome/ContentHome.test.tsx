import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { renderWithProviders } from '@/test/render'
import ContentHome from './ContentHome'

const mockFetch = (response: Response) => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
}

const renderHome = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<ContentHome />} />
      <Route path="/content/2" element={<p>ID 2 のページ</p>} />
    </Routes>,
  )

describe('ContentHome', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('一覧の先頭のページへ移動する', async () => {
    mockFetch(Response.json([{ id: 3 }, { id: 2 }]))

    renderHome()

    expect(await screen.findByText('ID 2 のページ')).toBeVisible()
  })

  it('ページが 0 件の場合は作成を促す', async () => {
    mockFetch(Response.json([]))

    renderHome()

    expect(await screen.findByText(/ページがありません/)).toBeVisible()
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    mockFetch(new Response('', { status: 500 }))

    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ページ一覧の取得に失敗しました',
    )
  })
})
