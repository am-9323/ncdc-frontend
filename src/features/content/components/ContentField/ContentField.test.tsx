import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import ContentField from './ContentField'

const renderField = (
  props: Partial<ComponentProps<typeof ContentField>> = {},
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ContentField contentId={1} field="title" value="坊ちゃん" {...props} />
    </QueryClientProvider>,
  )

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole('button', { name }))

describe('ContentField', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('タイトルは見出しとして表示する', () => {
    renderField()

    expect(screen.getByRole('heading', { name: '坊ちゃん' })).toBeVisible()
  })

  it('タイトルが空の場合は「無題」と表示する', () => {
    renderField({ value: '' })

    expect(screen.getByRole('heading', { name: '無題' })).toBeVisible()
  })

  it('Edit で保存済みの値を入力欄に表示し、Cancel・Save を表示する', async () => {
    renderField({ field: 'body', value: '本文です' })

    await clickButton('Edit')

    expect(screen.getByRole('textbox', { name: '本文' })).toHaveValue(
      '本文です',
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  it('Cancel で入力を破棄して元の値に戻す', async () => {
    renderField()

    await clickButton('Edit')
    await userEvent.type(screen.getByRole('textbox'), '追記')
    await clickButton('Cancel')

    expect(screen.getByRole('heading', { name: '坊ちゃん' })).toBeVisible()
    await clickButton('Edit')
    expect(screen.getByRole('textbox')).toHaveValue('坊ちゃん')
  })

  it('Save で編集した項目だけを PUT し、表示に戻す', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ id: 1 }))
    renderField({ contentId: 5 })

    await clickButton('Edit')
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), '方丈記')
    await clickButton('Save')

    expect(await screen.findByRole('heading')).toBeVisible()
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/content\/5$/)
    expect(init?.method).toBe('PUT')
    expect(JSON.parse(String(init?.body))).toEqual({ title: '方丈記' })
  })

  it('保存に失敗した場合はエラーを表示し、入力を維持する', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 500 }),
    )
    renderField()

    await clickButton('Edit')
    await userEvent.type(screen.getByRole('textbox'), '追記')
    await clickButton('Save')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'タイトルの保存に失敗しました',
    )
    expect(screen.getByRole('textbox')).toHaveValue('坊ちゃん追記')
  })

  it('initialEditing の場合は編集状態で開く', () => {
    renderField({ initialEditing: true })

    expect(screen.getByRole('textbox')).toHaveValue('坊ちゃん')
  })
})
