/**
 * アプリ内の URL を一元管理する。
 * - path: ルーター定義用のパターン
 * - getHref: リンクや画面遷移で使う実際の URL を組み立てる
 */
export const paths = {
  root: {
    path: '/',
    getHref: () => '/',
  },
  content: {
    path: '/content/:id',
    getHref: (id: number) => `/content/${id}`,
  },
} as const
