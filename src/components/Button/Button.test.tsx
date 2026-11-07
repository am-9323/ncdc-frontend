import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('ラベルを表示し、クリックで onClick を呼ぶ', async () => {
    const onClick = vi.fn()
    render(<Button icon="/icon.svg" label="Edit" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disabled の場合はクリックしても onClick を呼ばない', async () => {
    const onClick = vi.fn()
    render(<Button icon="/icon.svg" label="Edit" onClick={onClick} disabled />)

    const button = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('既定の type は button', () => {
    render(<Button icon="/icon.svg" label="Edit" />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
