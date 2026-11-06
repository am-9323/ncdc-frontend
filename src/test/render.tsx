import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

type Options = {
  /** 初期表示する URL */
  route?: string
}

/**
 * QueryClient と Router を用意してコンポーネントを描画する。
 * テスト間でキャッシュが共有されないよう、毎回新しい QueryClient を作る。
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/' }: Options = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}
