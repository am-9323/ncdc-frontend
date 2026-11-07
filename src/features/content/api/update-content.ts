import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/api/content-keys'
import type { Content } from '@/features/content/types'
import { apiClient } from '@/lib/api-client'

type UpdateContentInput = {
  /** 更新するページの ID */
  id: number
  /** 新しいタイトル。省略すると変更しない */
  title?: string
  /** 新しい本文。省略すると変更しない */
  body?: string
}

/**
 * ページのタイトルや本文を更新する。
 *
 * @param input - 更新するページの ID と、変更する項目
 * @returns 更新後のページ
 * @throws `ApiError` API がエラーレスポンスを返した場合
 * @throws `Error` レスポンスが空で、更新後のページを取得できない場合
 */
export const updateContent = async ({
  id,
  ...changes
}: UpdateContentInput): Promise<Content> => {
  const content = await apiClient.put<Content>(`/content/${id}`, changes)
  if (content === null) {
    throw new Error('ページの更新結果を取得できませんでした')
  }
  return content
}

/**
 * ページを更新する Mutation フック。
 *
 * 成功時は一覧と詳細のキャッシュを無効化し、サイドバーのタイトルも更新する。
 *
 * @returns TanStack Query の Mutation 結果
 */
export const useUpdateContent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateContent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contentKeys.all }),
  })
}
