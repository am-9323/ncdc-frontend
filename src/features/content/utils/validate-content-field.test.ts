import { countCharacters, validateContentField } from './validate-content-field'

describe('countCharacters', () => {
  it('絵文字を 1 文字として数える', () => {
    expect(countCharacters('😀あ')).toBe(2)
  })

  it('改行を 1 文字として数える', () => {
    expect(countCharacters('あ\nい')).toBe(3)
  })
})

describe('validateContentField', () => {
  describe('タイトル', () => {
    it.each([
      ['空', '', false],
      ['空白だけ', '  　', false],
      ['1 文字', 'あ', true],
      ['50 文字', 'あ'.repeat(50), true],
      ['51 文字', 'あ'.repeat(51), false],
      ['絵文字 50 文字', '😀'.repeat(50), true],
    ])('%s の場合は %s', (_, value, expected) => {
      expect(validateContentField('title', value)).toBe(expected)
    })
  })

  describe('本文', () => {
    it.each([
      ['9 文字', 'あ'.repeat(9), false],
      ['10 文字', 'あ'.repeat(10), true],
      ['改行を含めて 10 文字', 'あ'.repeat(9) + '\n', true],
      ['2000 文字', 'あ'.repeat(2000), true],
      ['2001 文字', 'あ'.repeat(2001), false],
    ])('%s の場合は %s', (_, value, expected) => {
      expect(validateContentField('body', value)).toBe(expected)
    })
  })
})
