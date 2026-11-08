import { screen, within } from '@testing-library/react'
import { buildContent } from '@/test/data-generators'
import { mockContentApi } from '@/test/mocks/content'
import { renderApp } from '@/test/render'

const twoContents = [
  buildContent({ id: 1, title: '坊ちゃん' }),
  buildContent({ id: 2, title: '方丈記' }),
]

const sidebar = () => screen.getByRole('complementary')
const main = () => screen.getByRole('main')

describe('ルーティング', () => {
  it('/ を開くと先頭のページへ移動する', async () => {
    // API は並び順を保証しないため、逆順で返しても ID の小さいページを先頭とする
    mockContentApi([...twoContents].reverse())

    const { router } = renderApp({ route: '/' })

    expect(
      await within(main()).findByRole('heading', { name: '坊ちゃん' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/content/1')
    expect(
      within(sidebar()).getByRole('link', { name: '坊ちゃん' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('/content/:id を開くとそのページを表示し、選択状態にする', async () => {
    mockContentApi(twoContents)

    renderApp({ route: '/content/2' })

    expect(
      await within(main()).findByRole('heading', { name: '方丈記' }),
    ).toBeVisible()
    expect(
      within(sidebar()).getByRole('link', { name: '方丈記' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('存在しない ID の場合は見つからない旨を表示し、サイドバーは表示したままにする', async () => {
    mockContentApi(twoContents)

    renderApp({ route: '/content/999' })

    expect(
      await within(main()).findByText('ページが見つかりません'),
    ).toBeVisible()
    expect(
      await within(sidebar()).findByRole('link', { name: '坊ちゃん' }),
    ).toBeVisible()
  })

  it('ID が数値でない場合は見つからない旨を表示し、ページを取得しない', async () => {
    const requests = mockContentApi(twoContents)

    renderApp({ route: '/content/abc' })

    expect(
      await within(sidebar()).findByRole('link', { name: '坊ちゃん' }),
    ).toBeVisible()
    expect(within(main()).getByText('ページが見つかりません')).toBeVisible()
    expect(requests.map(({ path }) => path)).toEqual(['/content'])
  })

  it('定義のないパスの場合は見つからない旨を表示する', async () => {
    mockContentApi(twoContents)

    renderApp({ route: '/foo' })

    expect(
      await within(main()).findByText('ページが見つかりません'),
    ).toBeVisible()
  })

  it('ページが 0 件の場合は、メインとサイドバーにページがない旨を表示する', async () => {
    mockContentApi([])

    renderApp({ route: '/' })

    expect(
      await within(main()).findByText('ページがありません。'),
    ).toBeVisible()
    expect(within(sidebar()).getByText('ページがありません')).toBeVisible()
  })
})
