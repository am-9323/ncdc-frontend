import styles from './Button.module.css'

type Props = {
  /** 見た目の種類。既定は `primary` */
  variant?: 'primary' | 'secondary' | 'normal'
  /** ボタンの幅。`default` は 90px、`compact` は 40px。既定は `default` */
  size?: 'default' | 'compact'
  /** ラベルの上に表示するアイコンの画像パス */
  icon: string
  /** アイコンの下に表示するラベル */
  label: string
  /** 押せない状態にする場合は `true` */
  disabled?: boolean
  /** クリック時の処理 */
  onClick?: () => void
}

/** アイコンとラベルを縦に並べたボタン */
export default function Button({
  variant = 'primary',
  size = 'default',
  icon,
  label,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      disabled={disabled}
      onClick={onClick}
    >
      <img src={icon} alt="" width={24} height={24} />
      <span className={styles.label}>{label}</span>
    </button>
  )
}
