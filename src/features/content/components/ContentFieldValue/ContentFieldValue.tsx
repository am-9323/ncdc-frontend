import styles from './ContentFieldValue.module.css'

type Props = {
  /** 表示する項目 */
  field: 'title' | 'body'
  /** 入力欄のラベル */
  label: string
  /** 保存済みの値 */
  value: string
  /** 編集中の入力内容。`null` は編集中でないことを表す */
  draft: string | null
  /** 入力内容が条件を満たさない場合は `true`。入力欄の枠を赤くする */
  isInvalid?: boolean
  /** 入力内容が変わったときの処理 */
  onChange: (value: string) => void
}

/** タイトルまたは本文の値。編集中は入力欄を表示する */
export default function ContentFieldValue({
  field,
  label,
  value,
  draft,
  isInvalid = false,
  onChange,
}: Props) {
  const isTitle = field === 'title'

  if (draft === null) {
    return isTitle ? (
      <h1 className={styles.title}>{value.trim() || '無題'}</h1>
    ) : (
      <p className={styles.body}>{value}</p>
    )
  }

  return isTitle ? (
    <input
      className={styles.titleInput}
      aria-label={label}
      aria-invalid={isInvalid}
      autoFocus
      value={draft}
      onChange={(event) => onChange(event.target.value)}
    />
  ) : (
    <textarea
      className={styles.bodyInput}
      aria-label={label}
      aria-invalid={isInvalid}
      autoFocus
      value={draft}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
