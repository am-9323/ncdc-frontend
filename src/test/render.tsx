import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  type InitialEntry,
} from 'react-router'
import { routes } from '@/app/router'

type Options = {
  /** 初期表示する URL */
  route?: InitialEntry
}

/**
 * テスト用の QueryClient を用意して描画する。
 * テスト間でキャッシュが共有されないよう毎回新しく作り、失敗時の再試行もしない。
 *
 * @param ui - 描画する要素
 * @returns Testing Library の描画結果
 */
const renderWithQueryClient = (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

/**
 * QueryClient と Router を用意してコンポーネントを描画する。
 *
 * @param ui - 描画するコンポーネント
 * @param options - 初期表示する URL など
 * @returns Testing Library の描画結果
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/' }: Options = {},
) =>
  renderWithQueryClient(
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>,
  )

/**
 * 本番と同じルート定義で、アプリ全体を描画する。結合テストに使う。
 *
 * @param options - 初期表示する URL など
 * @returns Testing Library の描画結果と、現在の URL を確認するためのルーター
 */
export const renderApp = ({ route = '/' }: Options = {}) => {
  const router = createMemoryRouter(routes, { initialEntries: [route] })
  return {
    ...renderWithQueryClient(<RouterProvider router={router} />),
    router,
  }
}
