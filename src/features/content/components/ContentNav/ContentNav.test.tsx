import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'
import { buildContent } from '@/test/data-generators'
import { mockContentApi } from '@/test/mocks/content'
import { validateContentField } from '@/features/content/utils/validate-content-field'
import { renderWithProviders } from '@/test/render'
import ContentNav from './ContentNav'

const twoContents = [
  buildContent({ id: 1, title: '坊ちゃん' }),
  buildContent({ id: 2, title: '方丈記' }),
]

/** 画面遷移時に渡された state を表示する */
const LocationState = () => <p>{JSON.stringify(useLocation().state)}</p>

const enterEditMode = async () => {
  await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
}

describe('ContentNav', () => {
  describe('編集モード', () => {
    it('Edit で New page・Done・削除ボタンを表示し、Done で元に戻す', async () => {
      mockContentApi(twoContents)
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
      const requests = mockContentApi(twoContents)
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(screen.getByRole('button', { name: 'New page' }))

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: '無題のページ' }),
        ).toHaveAttribute('aria-current', 'page')
      })

      const [{ body }] = requests.filter(({ method }) => method === 'POST')
      expect(body?.title).toBe('無題のページ')
      expect(validateContentField('title', body?.title ?? '')).toBe(true)
      expect(validateContentField('body', body?.body ?? '')).toBe(true)
    })

    it('作成したページへタイトルを編集する指定を付けて遷移する', async () => {
      mockContentApi(twoContents)
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
      mockContentApi(twoContents, { failOn: 'POST' })
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
      const requests = mockContentApi(twoContents)
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
      expect(requests.filter(({ method }) => method === 'DELETE')).toHaveLength(
        1,
      )
    })

    it('確認ダイアログに一覧と同じタイトルを表示する', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      mockContentApi([buildContent({ title: null })])
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '無題を削除' }),
      )

      expect(confirm).toHaveBeenCalledWith('「無題」を削除しますか？')
    })

    it('確認でキャンセルなら DELETE しない', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const requests = mockContentApi(twoContents)
      renderWithProviders(<ContentNav />)
      await enterEditMode()

      await userEvent.click(
        await screen.findByRole('button', { name: '方丈記を削除' }),
      )

      expect(requests.filter(({ method }) => method === 'DELETE')).toHaveLength(
        0,
      )
      expect(screen.getByRole('link', { name: '方丈記' })).toBeVisible()
    })

    it('選択中のページを削除すると次のページを選択する', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      mockContentApi(twoContents)
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
      mockContentApi(twoContents, { failOn: 'DELETE' })
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
