import { useParams } from 'react-router'

export default function ContentRoute() {
  const { id } = useParams()

  // TODO: features/content の詳細コンポーネントに id を渡す
  return <p>ページ ID: {id}</p>
}
