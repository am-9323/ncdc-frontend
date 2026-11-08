import { http, HttpResponse } from 'msw'
import { apiUrl, server } from '@/test/server'
import { ApiError, apiClient } from './api-client'

/**
 * どのメソッド・パスのリクエストにも、指定したレスポンスを返す。
 *
 * @param response - 返すレスポンス
 * @returns 受け取ったリクエストの一覧。リクエストのたびに追加される
 */
const respondWith = (response: () => Response) => {
  const requests: Request[] = []
  server.use(
    http.all(apiUrl('/*'), ({ request }) => {
      requests.push(request)
      return response()
    }),
  )
  return requests
}

describe('apiClient.get', () => {
  it('JSON レスポンスをパースして返す', async () => {
    respondWith(() => HttpResponse.json({ id: 1 }))

    await expect(apiClient.get('/content/1')).resolves.toEqual({ id: 1 })
  })

  it('空レスポンスの場合は null を返す', async () => {
    respondWith(() => new HttpResponse(null, { status: 200 }))

    await expect(apiClient.get('/content/999')).resolves.toBeNull()
  })

  it('エラーステータスの場合は ApiError を throw する', async () => {
    respondWith(() => new HttpResponse(null, { status: 500 }))

    await expect(apiClient.get('/content')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
    await expect(apiClient.get('/content')).rejects.toBeInstanceOf(ApiError)
  })

  it('GET で送り、Content-Type ヘッダーを付けない', async () => {
    const requests = respondWith(() => HttpResponse.json([]))

    await apiClient.get('/content')

    expect(requests[0].method).toBe('GET')
    expect(requests[0].headers.get('Content-Type')).toBeNull()
  })
})

describe.each([
  ['post', 'POST'],
  ['put', 'PUT'],
] as const)('apiClient.%s', (name, method) => {
  it('本文を JSON で送り、レスポンスを返す', async () => {
    const requests = respondWith(() => HttpResponse.json({ id: 1 }))

    const result = await apiClient[name]('/content', { title: 'タイトル' })

    expect(result).toEqual({ id: 1 })
    expect(requests[0].method).toBe(method)
    expect(requests[0].headers.get('Content-Type')).toBe('application/json')
    await expect(requests[0].json()).resolves.toEqual({ title: 'タイトル' })
  })
})

describe('apiClient.delete', () => {
  it('DELETE で送り、204 の場合は null を返す', async () => {
    const requests = respondWith(() => new HttpResponse(null, { status: 204 }))

    await expect(apiClient.delete('/content/1')).resolves.toBeNull()
    expect(requests[0].method).toBe('DELETE')
  })
})
