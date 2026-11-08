import { http, HttpResponse } from 'msw'
import { buildContent } from '@/test/data-generators'
import type { Content } from '@/features/content/types'
import { apiUrl, server } from '@/test/server'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type Options = {
  /** 500 エラーを返す HTTP メソッド */
  failOn?: Method
}

/** API が受け取ったリクエスト */
type RecordedRequest = {
  /** HTTP メソッド */
  method: Method
  /** パス（例: `/content/1`） */
  path: string
  /** 送られた本文。本文がない場合は `null` */
  body: Partial<Pick<Content, 'title' | 'body'>> | null
}

/** POST で作成したページに付ける ID */
export const CREATED_CONTENT_ID = 100

/** 本文が空の 200 レスポンス。存在しない ID を指定したときの API の挙動を再現する */
const emptyResponse = () => new HttpResponse(null, { status: 200 })

/**
 * メモリ上のページ一覧を操作する API のモックを MSW に登録する。
 *
 * - `GET /content`: 現在の一覧を、渡された順のまま返す
 * - `GET /content/:id`: 該当するページを返す
 * - `POST /content`: 送られた本文で ID {@link CREATED_CONTENT_ID} のページを作り、一覧の末尾に加える
 * - `PUT /content/:id`: 送られた項目だけを更新して返す
 * - `DELETE /content/:id`: 一覧から除き、204 を返す
 *
 * 実際の API に合わせ、存在しない ID の GET・PUT は本文が空の 200、DELETE は 500 を返す。
 *
 * @param initialContents - 最初の一覧
 * @param options - 失敗させる HTTP メソッドなど
 * @returns 受け取ったリクエストの一覧。リクエストのたびに追加される
 */
export const mockContentApi = (
  initialContents: Content[],
  { failOn }: Options = {},
) => {
  let contents = initialContents
  const requests: RecordedRequest[] = []

  /**
   * リクエストを記録し、失敗させるメソッドなら 500 を返す。
   *
   * @param request - 受け取ったリクエスト
   * @returns 記録した本文と、失敗させる場合は 500 のレスポンス
   */
  const record = async (request: Request) => {
    const method = request.method as Method
    const body = ['POST', 'PUT'].includes(method) ? await request.json() : null
    requests.push({ method, path: new URL(request.url).pathname, body })

    const failure =
      method === failOn ? new HttpResponse(null, { status: 500 }) : undefined
    return { body, failure }
  }

  const findContent = (id: string) =>
    contents.find((content) => content.id === Number(id))

  server.use(
    http.get(apiUrl('/content'), async ({ request }) => {
      const { failure } = await record(request)
      return failure ?? HttpResponse.json(contents)
    }),

    http.get(apiUrl('/content/:id'), async ({ request, params }) => {
      const { failure } = await record(request)
      const content = findContent(String(params.id))
      return failure ?? (content ? HttpResponse.json(content) : emptyResponse())
    }),

    http.post(apiUrl('/content'), async ({ request }) => {
      const { body, failure } = await record(request)
      if (failure) {
        return failure
      }
      const created = buildContent({ id: CREATED_CONTENT_ID, ...body })
      contents = [...contents, created]
      return HttpResponse.json(created, { status: 201 })
    }),

    http.put(apiUrl('/content/:id'), async ({ request, params }) => {
      const { body, failure } = await record(request)
      if (failure) {
        return failure
      }
      const content = findContent(String(params.id))
      if (!content) {
        return emptyResponse()
      }
      const updated = { ...content, ...body }
      contents = contents.map((item) =>
        item.id === updated.id ? updated : item,
      )
      return HttpResponse.json(updated)
    }),

    http.delete(apiUrl('/content/:id'), async ({ request, params }) => {
      const { failure } = await record(request)
      const content = findContent(String(params.id))
      if (failure || !content) {
        return failure ?? new HttpResponse(null, { status: 500 })
      }
      contents = contents.filter((item) => item !== content)
      return new HttpResponse(null, { status: 204 })
    }),
  )

  return requests
}
