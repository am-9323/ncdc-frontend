import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildContent } from '@/test/data-generators'
import { CREATED_CONTENT_ID, mockContentApi } from '@/test/mocks/content'
import { renderApp } from '@/test/render'

const twoContents = [
  buildContent({ id: 1, title: '坊ちゃん', body: '親譲りの無鉄砲で' }),
  buildContent({ id: 2, title: '方丈記', body: 'ゆく河の流れは絶えずして' }),
]

/**
 * 削除後の選択を確かめる 3 件の一覧。
 * 2 件だと「次・前のページ」と「先頭のページ」が同じになり、どの処理で選ばれたか区別できないため使う。
 */
const threeContents = [...twoContents, buildContent({ id: 3, title: '徒然草' })]

const sidebar = () => screen.getByRole('complementary')
const main = () => screen.getByRole('main')

/**
 * メインエリアの項目（タイトル・本文）の範囲を返す。
 *
 * @param name - 項目名
 * @returns 項目の要素
 */
const field = (name: 'タイトル' | '本文') =>
  within(main()).getByRole('region', { name })

/**
 * メインエリアに、指定したタイトルのページが表示されるまで待つ。
 *
 * @param title - 表示を待つタイトル
 * @returns タイトルの見出し要素
 */
const findMainTitle = (title: string) =>
  within(main()).findByRole('heading', { name: title })

/**
 * サイドバーのページへのリンクを返す。
 *
 * @param title - ページのタイトル
 * @returns リンクの要素
 */
const sidebarLink = (title: string) =>
  within(sidebar()).getByRole('link', { name: title })

/**
 * メインエリアの項目を編集して保存する。
 *
 * @param name - 編集する項目名
 * @param value - 入力する値
 */
const editAndSave = async (name: 'タイトル' | '本文', value: string) => {
  await userEvent.click(
    within(field(name)).getByRole('button', { name: 'Edit' }),
  )
  const input = within(field(name)).getByRole('textbox', { name })
  await userEvent.clear(input)
  await userEvent.type(input, value)
  await userEvent.click(
    within(field(name)).getByRole('button', { name: 'Save' }),
  )
}

/** サイドバーを編集モードにする */
const enterSidebarEditMode = async () => {
  await userEvent.click(within(sidebar()).getByRole('button', { name: 'Edit' }))
}

/**
 * サイドバーからページを削除する。確認ダイアログは OK を選ぶ。
 *
 * @param title - 削除するページのタイトル
 */
const deleteFromSidebar = async (title: string) => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  await enterSidebarEditMode()
  await userEvent.click(
    within(sidebar()).getByRole('button', { name: `${title}を削除` }),
  )
}

describe('ページの切り替え', () => {
  it('サイドバーでページを選ぶと、メインの表示と選択状態が切り替わる', async () => {
    mockContentApi(twoContents)
    renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    await userEvent.click(sidebarLink('方丈記'))

    expect(await findMainTitle('方丈記')).toBeVisible()
    expect(sidebarLink('方丈記')).toHaveAttribute('aria-current', 'page')
    expect(sidebarLink('坊ちゃん')).not.toHaveAttribute('aria-current')
  })

  it('編集中にページを移動すると、編集状態をリセットする', async () => {
    mockContentApi(twoContents)
    renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')
    // 両ページを取得済みにし、移動時に読み込み中の表示を挟まない状態にする
    await userEvent.click(sidebarLink('方丈記'))
    await findMainTitle('方丈記')
    await userEvent.click(sidebarLink('坊ちゃん'))
    await findMainTitle('坊ちゃん')
    await userEvent.click(
      within(field('タイトル')).getByRole('button', { name: 'Edit' }),
    )

    await userEvent.click(sidebarLink('方丈記'))

    expect(await findMainTitle('方丈記')).toBeVisible()
    expect(within(main()).queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('編集・保存', () => {
  it('タイトルを保存すると、メインとサイドバーの両方に反映する', async () => {
    mockContentApi(twoContents)
    renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    await editAndSave('タイトル', '吾輩は猫である')

    expect(await findMainTitle('吾輩は猫である')).toBeVisible()
    expect(
      await within(sidebar()).findByRole('link', { name: '吾輩は猫である' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('本文を保存すると、メインの本文に反映する', async () => {
    mockContentApi(twoContents)
    renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    await editAndSave('本文', '吾輩は猫である。名前はまだ無い。')

    await waitFor(() => {
      expect(field('本文')).toHaveTextContent(
        '吾輩は猫である。名前はまだ無い。',
      )
    })
    expect(within(field('本文')).queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('ページ作成', () => {
  it('New page を押すと、作成したページを選択し、タイトルを編集状態で開く', async () => {
    mockContentApi(twoContents)
    const { router } = renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    await enterSidebarEditMode()
    await userEvent.click(
      within(sidebar()).getByRole('button', { name: 'New page' }),
    )

    expect(
      await within(main()).findByRole('textbox', { name: 'タイトル' }),
    ).toHaveValue('無題のページ')
    expect(router.state.location.pathname).toBe(
      `/content/${CREATED_CONTENT_ID}`,
    )
    expect(
      await within(sidebar()).findByRole('link', { name: '無題のページ' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('作成したページのタイトルを保存すると、サイドバーに反映する', async () => {
    mockContentApi(twoContents)
    renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')
    await enterSidebarEditMode()
    await userEvent.click(
      within(sidebar()).getByRole('button', { name: 'New page' }),
    )
    const input = await within(main()).findByRole('textbox', {
      name: 'タイトル',
    })

    await userEvent.clear(input)
    await userEvent.type(input, '新しいページ')
    await userEvent.click(
      within(field('タイトル')).getByRole('button', { name: 'Save' }),
    )

    expect(await findMainTitle('新しいページ')).toBeVisible()
    expect(
      await within(sidebar()).findByRole('link', { name: '新しいページ' }),
    ).toBeVisible()
  })
})

describe('ページ削除', () => {
  it('選択中の先頭のページを削除すると、次のページを表示する', async () => {
    mockContentApi(twoContents)
    const { router } = renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    await deleteFromSidebar('坊ちゃん')

    expect(await findMainTitle('方丈記')).toBeVisible()
    expect(router.state.location.pathname).toBe('/content/2')
  })

  it('選択中の末尾のページを削除すると、前のページを表示する', async () => {
    mockContentApi(threeContents)
    const { router } = renderApp({ route: '/content/3' })
    await findMainTitle('徒然草')

    await deleteFromSidebar('徒然草')

    expect(await findMainTitle('方丈記')).toBeVisible()
    expect(router.state.location.pathname).toBe('/content/2')
  })

  it('最後の 1 件を削除すると、トップへ移動してページがない旨を表示する', async () => {
    mockContentApi([twoContents[0]])
    const { router } = renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    await deleteFromSidebar('坊ちゃん')

    expect(
      await within(main()).findByText('ページがありません。'),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/')
    expect(within(sidebar()).getByText('ページがありません')).toBeVisible()
  })

  it('選択中でないページを削除しても、メインの表示は変わらない', async () => {
    mockContentApi(threeContents)
    const { router } = renderApp({ route: '/content/1' })
    await findMainTitle('坊ちゃん')

    // 削除するページの前後（方丈記）と、選択中のページが異なる組み合わせにする
    await deleteFromSidebar('徒然草')

    await waitFor(() => {
      expect(
        within(sidebar()).queryByRole('link', { name: '徒然草' }),
      ).not.toBeInTheDocument()
    })
    expect(
      within(main()).getByRole('heading', { name: '坊ちゃん' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/content/1')
  })
})
