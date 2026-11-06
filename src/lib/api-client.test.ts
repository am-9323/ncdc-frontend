import { ApiError, apiClient } from './api-client'

describe('apiClient.get', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('JSON レスポンスをパースして返す', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    )

    await expect(apiClient.get('/content/1')).resolves.toEqual({ id: 1 })
  })

  it('空レスポンスの場合は null を返す', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 200 }),
    )

    await expect(apiClient.get('/content/999')).resolves.toBeNull()
  })

  it('エラーステータスの場合は ApiError を throw する', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 500 }),
    )

    await expect(apiClient.get('/content')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
    await expect(apiClient.get('/content')).rejects.toBeInstanceOf(ApiError)
  })

  it('Content-Type ヘッダーを付けない', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('[]', { status: 200 }))

    await apiClient.get('/content')

    expect(fetchMock.mock.calls[0][1]?.headers).toBeUndefined()
  })
})

describe.each([
  ['post', 'POST'],
  ['put', 'PUT'],
] as const)('apiClient.%s', (name, method) => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('本文を JSON で送り、レスポンスを返す', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{"id":1}', { status: 200 }))

    const result = await apiClient[name]('/content', { title: 'タイトル' })

    expect(result).toEqual({ id: 1 })
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method,
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"タイトル"}',
    })
  })
})

describe('apiClient.delete', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('DELETE で送り、204 の場合は null を返す', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiClient.delete('/content/1')).resolves.toBeNull()
    expect(fetchMock.mock.calls[0][1]).toEqual({ method: 'DELETE' })
  })
})
