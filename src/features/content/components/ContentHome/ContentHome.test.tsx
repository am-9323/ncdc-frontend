import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { buildContent } from '@/test/data-generators'
import { mockContentApi } from '@/test/mocks/content'
import { renderWithProviders } from '@/test/render'
import ContentHome from './ContentHome'

const renderHome = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<ContentHome />} />
      <Route path="/content/2" element={<p>ID 2 のページ</p>} />
    </Routes>,
  )

describe('ContentHome', () => {
  it('一覧の先頭のページへ移動する', async () => {
    mockContentApi([buildContent({ id: 3 }), buildContent({ id: 2 })])

    renderHome()

    expect(await screen.findByText('ID 2 のページ')).toBeVisible()
  })

  it('ページが 0 件の場合は作成を促す', async () => {
    mockContentApi([])

    renderHome()

    expect(await screen.findByText(/ページがありません/)).toBeVisible()
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    mockContentApi([], { failOn: 'GET' })

    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ページ一覧の取得に失敗しました',
    )
  })
})
