import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from 'react-router'
import { renderWithProviders } from '@/test/render'
import AppLayout from './AppLayout'

const renderLayout = () =>
  renderWithProviders(
    <AppLayout sidebar={<Link to="/content/2">方丈記</Link>}>
      <p>本文</p>
    </AppLayout>,
    { route: '/content/1' },
  )

const menuButton = () => screen.getByRole('button', { name: 'メニューを開く' })

describe('AppLayout', () => {
  it('メニューボタンでメニューを開き、閉じるボタンで閉じる', async () => {
    renderLayout()
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(menuButton())
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(
      screen.getByRole('button', { name: 'メニューを閉じる' }),
    )
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('メニューからページを移動するとメニューを閉じる', async () => {
    renderLayout()

    await userEvent.click(menuButton())
    await userEvent.click(screen.getByRole('link', { name: '方丈記' }))

    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })
})
