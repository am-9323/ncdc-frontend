import { useParams } from 'react-router'
import NotFoundRoute from '@/app/routes/not-found'
import ContentDetail from '@/features/content/components/ContentDetail/ContentDetail'

/** ページ詳細画面 */
export default function ContentRoute() {
  const id = Number(useParams().id)

  if (!Number.isInteger(id)) {
    return <NotFoundRoute />
  }

  // key を指定し、ページを移動したら編集状態をリセットする
  return <ContentDetail key={id} id={id} />
}
