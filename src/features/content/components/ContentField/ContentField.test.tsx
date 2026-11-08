import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { buildContent } from '@/test/data-generators'
import { mockContentApi } from '@/test/mocks/content'
import { renderWithProviders } from '@/test/render'
import ContentField from './ContentField'

const renderField = (
  props: Partial<ComponentProps<typeof ContentField>> = {},
) =>
  renderWithProviders(
    <ContentField contentId={1} field="title" value="坊ちゃん" {...props} />,
  )

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole('button', { name }))

describe('ContentField', () => {
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
    const requests = mockContentApi([
      buildContent({ id: 5, title: '坊ちゃん' }),
    ])
    renderField({ contentId: 5 })

    await clickButton('Edit')
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), '方丈記')
    await clickButton('Save')

    expect(await screen.findByRole('heading')).toBeVisible()
    expect(requests).toEqual([
      { method: 'PUT', path: '/content/5', body: { title: '方丈記' } },
    ])
  })

  it('保存に失敗した場合はエラーを表示し、入力を維持する', async () => {
    mockContentApi([buildContent({ id: 1 })], { failOn: 'PUT' })
    renderField()

    await clickButton('Edit')
    await userEvent.type(screen.getByRole('textbox'), '追記')
    await clickButton('Save')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'タイトルの保存に失敗しました',
    )
    expect(screen.getByRole('textbox')).toHaveValue('坊ちゃん追記')
  })

  it('条件を満たさない場合は保存せず、メッセージを表示する', async () => {
    const requests = mockContentApi([buildContent({ id: 1 })])
    renderField()

    await clickButton('Edit')
    await userEvent.clear(screen.getByRole('textbox'))
    await clickButton('Save')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'タイトルは1〜50文字で入力してください',
    )
    expect(screen.getByRole('textbox')).toBeInvalid()
    expect(requests).toEqual([])
  })

  it('本文は 10 文字未満の場合に保存しない', async () => {
    const requests = mockContentApi([buildContent({ id: 1 })])
    renderField({ field: 'body', value: '9文字の本文です。' })

    await clickButton('Edit')
    await clickButton('Save')

    expect(screen.getByRole('alert')).toHaveTextContent(
      '本文は10〜2000文字で入力してください',
    )
    expect(requests).toEqual([])
  })

  it('条件を満たす値で Save し直すとメッセージを消す', async () => {
    mockContentApi([buildContent({ id: 1 })])
    renderField()

    await clickButton('Edit')
    await userEvent.clear(screen.getByRole('textbox'))
    await clickButton('Save')
    await userEvent.type(screen.getByRole('textbox'), '方丈記')
    await clickButton('Save')

    expect(await screen.findByRole('heading')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Cancel でメッセージを消す', async () => {
    renderField()

    await clickButton('Edit')
    await userEvent.clear(screen.getByRole('textbox'))
    await clickButton('Save')
    await clickButton('Cancel')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await clickButton('Edit')
    expect(screen.getByRole('textbox')).toBeValid()
  })

  it('initialEditing の場合は編集状態で開く', () => {
    renderField({ initialEditing: true })

    expect(screen.getByRole('textbox')).toHaveValue('坊ちゃん')
  })
})
