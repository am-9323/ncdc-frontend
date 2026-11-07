import { useQuery } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/api/content-keys'
import { apiClient } from '@/lib/api-client'
import type { Content } from '@/features/content/types'

/**
 * ページ一覧を取得する。
 *
 * API は並び順を保証しないため、作成順（ID 昇順）に並べ替えて返す。
 *
 * @returns ID 昇順のページ一覧。レスポンスが空の場合は空配列
 * @throws `ApiError` API がエラーレスポンスを返した場合
 */
export const getContents = async (): Promise<Content[]> => {
  const contents = await apiClient.get<Content[]>('/content')
  return (contents ?? []).toSorted((a, b) => a.id - b.id)
}

/**
 * ページ一覧を取得する Query フック。
 *
 * @returns TanStack Query の Query 結果。`data` は ID 昇順のページ一覧
 */
export const useContents = () =>
  useQuery({
    queryKey: contentKeys.list,
    queryFn: getContents,
  })
