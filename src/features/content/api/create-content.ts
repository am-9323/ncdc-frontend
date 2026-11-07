import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contentKeys } from '@/features/content/api/content-keys'
import type { Content } from '@/features/content/types'
import { apiClient } from '@/lib/api-client'

/** 作成直後からバリデーションを満たす既定値 */
const DEFAULT_CONTENT = {
  title: '無題のページ',
  body: '本文を入力してください。',
}

/**
 * 既定値で新しいページを作成する。
 *
 * @returns 作成したページ
 * @throws `ApiError` API がエラーレスポンスを返した場合
 * @throws `Error` レスポンスが空で、作成したページを取得できない場合
 */
export const createContent = async (): Promise<Content> => {
  const content = await apiClient.post<Content>('/content', DEFAULT_CONTENT)
  if (content === null) {
    throw new Error('ページの作成結果を取得できませんでした')
  }
  return content
}

/**
 * ページを作成する Mutation フック。
 *
 * 成功時はページ一覧のキャッシュを無効化し、一覧を再取得する。
 *
 * @returns TanStack Query の Mutation 結果。
 */
export const useCreateContent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createContent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contentKeys.list }),
  })
}
