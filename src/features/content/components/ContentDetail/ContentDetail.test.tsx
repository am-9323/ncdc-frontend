import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildContent } from '@/test/data-generators'
import { mockContentApi } from '@/test/mocks/content'
import { renderWithProviders } from '@/test/render'
import ContentDetail from './ContentDetail'

const content = buildContent({
  id: 1,
  title: '坊ちゃん',
  body: '親譲りの無鉄砲で\n小供の時から損ばかりしている。',
})

describe('ContentDetail', () => {
  it('タイトルと本文を表示する', async () => {
    mockContentApi([content])

    renderWithProviders(<ContentDetail id={1} />)

    expect(
      await screen.findByRole('heading', { name: '坊ちゃん' }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: '本文' })).toHaveTextContent(
      '親譲りの無鉄砲で',
    )
  })

  it('取得に失敗した場合はエラーメッセージを表示する', async () => {
    mockContentApi([content], { failOn: 'GET' })

    renderWithProviders(<ContentDetail id={1} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ページの取得に失敗しました',
    )
  })

  it('存在しない ID の場合は見つからない旨を表示する', async () => {
    mockContentApi([])

    renderWithProviders(<ContentDetail id={1} />)

    expect(await screen.findByText('ページが見つかりません')).toBeVisible()
  })

  it('タイトルと本文を同時に編集できる', async () => {
    mockContentApi([content])
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
    mockContentApi([content])

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
