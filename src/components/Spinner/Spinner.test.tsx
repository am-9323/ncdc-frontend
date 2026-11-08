import { render, screen } from '@testing-library/react'
import Spinner from './Spinner'

describe('Spinner', () => {
  it('「読み込み中」という名前の status として表示する', () => {
    render(<Spinner />)

    expect(
      screen.getByRole('status', { name: '読み込み中' }),
    ).toBeInTheDocument()
  })
})
