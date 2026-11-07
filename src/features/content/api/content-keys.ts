/** ページ関連の TanStack Query のキー */
export const contentKeys = {
  all: ['contents'] as const,
  list: ['contents', 'list'] as const,
  detail: (id: number) => ['contents', 'detail', id] as const,
}
