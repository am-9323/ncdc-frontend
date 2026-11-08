import type { Content } from '@/features/content/types'

/**
 * テスト用のページを作る。
 *
 * @param overrides - 既定値から変更する項目
 * @returns 既定値に `overrides` を上書きしたページ
 */
export const buildContent = (overrides: Partial<Content> = {}): Content => ({
  id: 1,
  title: 'タイトル',
  body: '本文',
  createdAt: '2022-06-02T00:00:00.000Z',
  updatedAt: '2022-06-02T00:00:00.000Z',
  ...overrides,
})
