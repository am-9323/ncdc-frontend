const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * API がエラーレスポンス（ステータスが 2xx 以外）を返したことを表すエラー。
 * 通信自体の失敗は fetch の TypeError のままで、このクラスにはならない。
 */
export class ApiError extends Error {
  /** HTTP ステータスコード */
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * API にリクエストを送り、レスポンスを JSON として返す。
 *
 * @param path - API のパス（例: `/content`）
 * @param init - fetch に渡すオプション（method、body など）
 * @returns パースしたレスポンス。本文が空の場合は `null`
 * @throws {@link ApiError} ステータスが 2xx 以外の場合
 */
const request = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> => {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API request failed: ${response.status} ${path}`,
    )
  }

  // 204 や、存在しない ID 指定時の「200 + 空レスポンス」は null として扱う
  const text = await response.text()
  return text === '' ? null : (JSON.parse(text) as T)
}

/**
 * JSON の本文を送るリクエストのオプションを作る。
 *
 * @param method - HTTP メソッド
 * @param body - JSON に変換して送る本文
 * @returns fetch に渡すオプション
 */
const jsonInit = (method: 'POST' | 'PUT', body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

/**
 * API を呼び出すクライアント。
 *
 * 各メソッドは本文が空のレスポンスを `null` として返し、
 * ステータスが 2xx 以外の場合は {@link ApiError} を throw する。
 */
export const apiClient = {
  /**
   * GET リクエストを送る。
   *
   * @param path - API のパス
   */
  get: <T>(path: string) => request<T>(path),

  /**
   * POST リクエストを送る。
   *
   * @param path - API のパス
   * @param body - JSON に変換して送る本文
   */
  post: <T>(path: string, body: unknown) =>
    request<T>(path, jsonInit('POST', body)),

  /**
   * PUT リクエストを送る。
   *
   * @param path - API のパス
   * @param body - JSON に変換して送る本文
   */
  put: <T>(path: string, body: unknown) =>
    request<T>(path, jsonInit('PUT', body)),

  /**
   * DELETE リクエストを送る。
   *
   * @param path - API のパス
   */
  delete: (path: string) => request<null>(path, { method: 'DELETE' }),
}
