import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IconButton from './IconButton'

describe('IconButton', () => {
  it('クリックすると onClick を呼ぶ', async () => {
    const onClick = vi.fn()
    render(<IconButton icon="/icon.svg" label="削除" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: '削除' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disabled の場合はクリックしても onClick を呼ばない', async () => {
    const onClick = vi.fn()
    render(
      <IconButton icon="/icon.svg" label="削除" onClick={onClick} disabled />,
    )

    const button = screen.getByRole('button', { name: '削除' })
    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('label を画面に表示せず、アクセシブルな名前にする', () => {
    render(<IconButton icon="/icon.svg" label="削除" />)

    expect(screen.getByRole('button', { name: '削除' })).toBeVisible()
    expect(screen.queryByText('削除')).not.toBeInTheDocument()
  })

  it('フォーム内でも送信しないよう type は button になる', () => {
    render(<IconButton icon="/icon.svg" label="削除" />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
