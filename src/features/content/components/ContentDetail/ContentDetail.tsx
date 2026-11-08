import { useLocation } from 'react-router'
import Spinner from '@/components/Spinner/Spinner'
import { useContent } from '@/features/content/api/get-content'
import ContentField from '@/features/content/components/ContentField/ContentField'
import styles from './ContentDetail.module.scss'

type Props = {
  /** 表示するページの ID */
  id: number
}

/** ページのタイトルと本文。読み込み中・エラー・見つからない場合はメッセージを表示する */
export default function ContentDetail({ id }: Props) {
  const { data: content, isPending, isError } = useContent(id)
  const location = useLocation()

  if (isPending) {
    return (
      <div className={styles.message}>
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <p className={styles.message} role="alert">
        ページの取得に失敗しました
      </p>
    )
  }

  if (content === null) {
    return <p className={styles.message}>ページが見つかりません</p>
  }

  return (
    <div className={styles.root}>
      <ContentField
        contentId={content.id}
        field="title"
        value={content.title ?? ''}
        initialEditing={location.state?.editTitle === true}
      />
      <ContentField
        contentId={content.id}
        field="body"
        value={content.body ?? ''}
      />
    </div>
  )
}
