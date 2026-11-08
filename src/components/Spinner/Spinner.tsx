import styles from './Spinner.module.scss'

/** 読み込み中を表す回転アイコン。スクリーンリーダーには「読み込み中」と読み上げる */
export default function Spinner() {
  return (
    <span className={styles.spinner} role="status" aria-label="読み込み中" />
  )
}
