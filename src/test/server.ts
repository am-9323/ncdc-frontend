import { setupServer } from 'msw/node'

/**
 * テストで API へのリクエストを受ける MSW のサーバー。
 *
 * 起動・停止とハンドラーのリセットは `setup.ts` で行う。
 * 各テストでは `server.use()` でハンドラーを追加する。
 */
export const server = setupServer()

/**
 * API の URL を組み立てる。MSW のハンドラーに渡す URL に使う。
 *
 * @param path - API のパス（例: `/content/:id`）
 * @returns API のベース URL を付けた URL
 */
export const apiUrl = (path: string) =>
  `${import.meta.env.VITE_API_BASE_URL}${path}`
