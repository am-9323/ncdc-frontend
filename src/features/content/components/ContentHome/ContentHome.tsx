import { Navigate } from 'react-router'
import { paths } from '@/config/paths'
import { useContents } from '@/features/content/api/get-contents'
import styles from './ContentHome.module.css'

/** トップ画面の中身。先頭のページへ移動し、ページがなければ作成を促す */
export default function ContentHome() {
  const { data: contents, isPending, isError } = useContents()

  if (isPending) {
    return <p className={styles.message}>読み込み中...</p>
  }

  if (isError) {
    return (
      <p className={styles.message} role="alert">
        ページ一覧の取得に失敗しました
      </p>
    )
  }

  const [firstContent] = contents
  if (firstContent) {
    return <Navigate to={paths.content.getHref(firstContent.id)} replace />
  }

  return <p className={styles.message}>ページがありません。</p>
}
