import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'
import type { Content } from '@/features/content/types'
import { renderWithProviders } from '@/test/render'
import ContentNav from './ContentNav'

const createContent = (overrides: Partial<Content>): Content => ({
  id: 1,
  title: 'タイトル',
  body: '本文',
  createdAt: '2022-06-02T00:00:00.000Z',
  updatedAt: '2022-06-02T00:00:00.000Z',
  ...overrides,
})

/** メモリ上の一覧を操作する API のモック。failOn の method は 500 を返す */
const mockApi = (
  initialContents: Content[],
  { failOn }: { failOn?: 'POST' | 'DELETE' } = {},
) => {
  let contents = initialContents

  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input, init) => {
      const method = init?.method ?? 'GET'

      if (method === failOn) {
        return new Response('', { status: 500 })
      }

      if (method === 'POST') {
        const created = createContent({
          id: 100,
          ...JSON.parse(String(init?.body)),
        })
        contents = [...contents, created]
        return Response.json(created, { status: 201 })
      }

      if (method === 'DELETE') {
        const id = Number(String(input).split('/').at(-1))
        contents = contents.filter((content) => content.id !== id)
        return new Response(null, { status: 204 })
      }

      return Response.json(contents)
    })
}

const findRequests = (fetchMock: ReturnType<typeof mockApi>, method: string) =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === method)

const twoContents = [
  createContent({ id: 1, title: '坊ちゃん' }),
  createContent({ id: 2, title: '方丈記' }),
]

/** 画面遷移時に渡された state を表示する */
const LocationState = () => <p>{JSON.stringify(useLocation().state)}</p>

const enterEditMode = async () => {
  await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
}

describe('ContentNav', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('編集モード', () => {
    it('Edit で New page・Done・削除ボタンを表示し、Done で元に戻す', async () => {
      mockApi(twoContents)
      renderWithProviders(<ContentNav />)

      expect(
        await screen.findByRole('link', { name: '坊ちゃん' }),
      ).toBeVisible()
      expect(
        screen.queryByRole('button', { name: '坊ちゃんを削除' }),
      ).not.toBeInTheDocument()

      await enterEditMode()

      expect(screen.getByRole('button', { name: 'New page' })).toBeVisible()
      expect(
        screen.getByRole('button', { name: '坊ちゃんを削除' }),
      ).toBeVisible()

      await userEvent.click(screen.getByRole('button', { name: 'Done' }))

      expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible()
      expect(
        screen.queryByRole('button', { name: 'New page' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('ページ作成', () => {
    it('New page で既定値を POST し、作成したページを選択状態にする', async () => {
      const fetchMock = mockApi(twoContents)
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(screen.getByRole('button', { name: 'New page' }))

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: '無題のページ' }),
        ).toHaveAttribute('aria-current', 'page')
      })

      const [[, init]] = findRequests(fetchMock, 'POST')
      const body = JSON.parse(String(init?.body))
      expect(body.title).toBe('無題のページ')
      expect(body.body.length).toBeGreaterThanOrEqual(10)
    })

    it('作成したページへタイトルを編集する指定を付けて遷移する', async () => {
      mockApi(twoContents)
      renderWithProviders(
        <>
          <ContentNav />
          <LocationState />
        </>,
      )
      await enterEditMode()

      await userEvent.click(screen.getByRole('button', { name: 'New page' }))

      expect(await screen.findByText('{"editTitle":true}')).toBeVisible()
    })

    it('失敗した場合はエラーメッセージを表示する', async () => {
      mockApi(twoContents, { failOn: 'POST' })
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(screen.getByRole('button', { name: 'New page' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'ページの作成に失敗しました',
      )
    })
  })

  describe('ページ削除', () => {
    it('確認で OK なら DELETE し、一覧から消す', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const fetchMock = mockApi(twoContents)
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '方丈記を削除' }),
      )

      await waitFor(() => {
        expect(
          screen.queryByRole('link', { name: '方丈記' }),
        ).not.toBeInTheDocument()
      })
      expect(findRequests(fetchMock, 'DELETE')).toHaveLength(1)
    })

    it('確認ダイアログに一覧と同じタイトルを表示する', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      mockApi([createContent({ title: null })])
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '無題を削除' }),
      )

      expect(confirm).toHaveBeenCalledWith('「無題」を削除しますか？')
    })

    it('確認でキャンセルなら DELETE しない', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const fetchMock = mockApi(twoContents)
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '方丈記を削除' }),
      )

      expect(findRequests(fetchMock, 'DELETE')).toHaveLength(0)
      expect(screen.getByRole('link', { name: '方丈記' })).toBeVisible()
    })

    it('選択中のページを削除すると次のページを選択する', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockApi(twoContents)
      renderWithProviders(<ContentNav />, { route: '/content/1' })
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '坊ちゃんを削除' }),
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: '方丈記' })).toHaveAttribute(
          'aria-current',
          'page',
        )
      })
    })

    it('失敗した場合はエラーメッセージを表示する', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockApi(twoContents, { failOn: 'DELETE' })
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '方丈記を削除' }),
      )

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'ページの削除に失敗しました',
      )
    })
  })
})
