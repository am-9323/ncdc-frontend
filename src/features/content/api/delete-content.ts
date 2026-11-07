import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/api/get-contents'
import { apiClient } from '@/lib/api-client'

/**
 * ページを削除する。
 *
 * @param id - 削除するページの ID
 * @returns API のレスポンスは本文が空のため、常に `null`
 * @throws `ApiError` API がエラーレスポンスを返した場合
 */
export const deleteContent = (id: number) => apiClient.delete(`/content/${id}`)

/**
 * ページを削除する Mutation フック。
 *
 * 成功時はページ一覧のキャッシュを無効化し、一覧を再取得する。
 *
 * @returns TanStack Query の Mutation 結果。
 */
export const useDeleteContent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteContent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
  })
}
