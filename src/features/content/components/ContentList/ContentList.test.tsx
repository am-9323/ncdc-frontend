import type { ComponentProps } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Content } from '@/features/content/types'
import { renderWithProviders } from '@/test/render'
import ContentList from './ContentList'

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

const renderContentList = (
  props: Partial<ComponentProps<typeof ContentList>> = {},
  options?: { route?: string },
) =>
  renderWithProviders(
    <ContentList
      isEditing={false}
      isDeleteDisabled={false}
      onDelete={vi.fn()}
      {...props}
    />,
    options,
  )

const twoContents = [
  createContent({ id: 1, title: '坊ちゃん' }),
  createContent({ id: 2, title: '方丈記' }),
]

describe('ContentList', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('一覧表示', () => {
    it('ページのタイトル一覧を ID 昇順で表示する', async () => {
      mockFetch(Response.json([...twoContents].reverse()))

      renderContentList()

      const links = await screen.findAllByRole('link')
      expect(links.map((link) => link.textContent)).toEqual([
        '坊ちゃん',
        '方丈記',
      ])
      expect(links[0]).toHaveAttribute('href', '/content/1')
    })

    it('タイトルが null の場合は「無題」と表示する', async () => {
      mockFetch(Response.json([createContent({ title: null })]))

      renderContentList()

      expect(await screen.findByRole('link', { name: '無題' })).toBeVisible()
    })

    it('現在の URL のページを選択状態にする', async () => {
      mockFetch(Response.json(twoContents))

      renderContentList({}, { route: '/content/2' })

      expect(
        await screen.findByRole('link', { name: '方丈記' }),
      ).toHaveAttribute('aria-current', 'page')
      expect(
        screen.getByRole('link', { name: '坊ちゃん' }),
      ).not.toHaveAttribute('aria-current')
    })

    it('ページが 0 件の場合はその旨を表示する', async () => {
      mockFetch(Response.json([]))

      renderContentList()

      expect(await screen.findByText('ページがありません')).toBeVisible()
    })

    it('取得に失敗した場合はエラーメッセージを表示する', async () => {
      mockFetch(new Response('', { status: 500 }))

      renderContentList()

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'ページ一覧の取得に失敗しました',
      )
    })
  })

  describe('ゴミ箱', () => {
    it('編集モードでない場合は表示しない', async () => {
      mockFetch(Response.json(twoContents))

      renderContentList()

      expect(
        await screen.findByRole('link', { name: '坊ちゃん' }),
      ).toBeVisible()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('編集モードの場合は各ページに表示する', async () => {
      mockFetch(Response.json(twoContents))

      renderContentList({ isEditing: true })

      expect(
        await screen.findByRole('button', { name: '坊ちゃんを削除' }),
      ).toBeVisible()
      expect(screen.getByRole('button', { name: '方丈記を削除' })).toBeVisible()
    })

    it('isDeleteDisabled の場合は押せない', async () => {
      mockFetch(Response.json(twoContents))

      renderContentList({ isEditing: true, isDeleteDisabled: true })

      expect(
        await screen.findByRole('button', { name: '坊ちゃんを削除' }),
      ).toBeDisabled()
    })

    it('押すと onDelete に ID と表示中のタイトルを渡す', async () => {
      mockFetch(Response.json([createContent({ id: 3, title: null })]))
      const onDelete = vi.fn()

      renderContentList({ isEditing: true, onDelete })
      await userEvent.click(
        await screen.findByRole('button', { name: '無題を削除' }),
      )

      expect(onDelete).toHaveBeenCalledExactlyOnceWith(3, '無題')
    })
  })
})
