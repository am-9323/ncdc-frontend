import { useQuery } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/api/content-keys'
import type { Content } from '@/features/content/types'
import { apiClient } from '@/lib/api-client'

/**
 * ページを 1 件取得する。
 *
 * @param id - 取得するページの ID
 * @returns ページ。API は存在しない ID に空のレスポンスを返すため、その場合は `null`
 * @throws `ApiError` API がエラーレスポンスを返した場合
 */
export const getContent = (id: number) =>
  apiClient.get<Content>(`/content/${id}`)

/**
 * ページを 1 件取得する Query フック。
 *
 * @param id - 取得するページの ID
 * @returns TanStack Query の Query 結果。存在しない ID の場合、`data` は `null`
 */
export const useContent = (id: number) =>
  useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => getContent(id),
  })
