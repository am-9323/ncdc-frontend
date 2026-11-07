/** タイトル・本文の文字数の条件 */
export const CONTENT_FIELD_RULES = {
  title: { min: 1, max: 50 },
  body: { min: 10, max: 2000 },
}

/**
 * 文字数を数える。
 *
 * `string.length` は UTF-16 の単位で数えるため、絵文字などのサロゲートペアを 1 文字として数え直す。
 *
 * @param value - 数える文字列
 * @returns 文字数。改行も 1 文字として数える
 */
export const countCharacters = (value: string) => [...value].length

/**
 * タイトルまたは本文が文字数の条件を満たすかを判定する。
 *
 * タイトルの下限は前後の空白を除いて数えるため、空白だけのタイトルは条件を満たさない。
 *
 * @param field - 判定する項目
 * @param value - 判定する値
 * @returns 条件を満たす場合は `true`
 */
export const validateContentField = (
  field: keyof typeof CONTENT_FIELD_RULES,
  value: string,
) => {
  const { min, max } = CONTENT_FIELD_RULES[field]
  const minTarget = field === 'title' ? value.trim() : value
  return countCharacters(minTarget) >= min && countCharacters(value) <= max
}
