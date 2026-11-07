import styles from './IconButton.module.css'

type Props = {
  /** 表示するアイコンの画像パス */
  icon: string
  /** スクリーンリーダー向けのラベル（画面には表示しない） */
  label: string
  /** メニューなどを開閉するボタンの場合の開閉状態。開いている場合は `true` */
  expanded?: boolean
  /** 押せない状態にする場合は `true` */
  disabled?: boolean
  /** クリック時の処理 */
  onClick?: () => void
}

/** アイコンのみのボタン */
export default function IconButton({
  icon,
  label,
  expanded,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
    >
      <img src={icon} alt="" width={24} height={24} />
    </button>
  )
}
