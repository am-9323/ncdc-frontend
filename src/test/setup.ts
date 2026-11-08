import '@testing-library/jest-dom/vitest'
import { server } from './server'

// ハンドラーのないリクエストは、モック漏れとしてテストを失敗させる
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
// テストで server.use() したハンドラーを、ほかのテストに持ち越さない
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
