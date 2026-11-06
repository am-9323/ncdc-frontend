import { NavLink } from 'react-router'
import { paths } from '@/config/paths'
import { useContents } from '@/features/content/api/get-contents'
import styles from './ContentNav.module.css'

const UNTITLED = '無題'

export default function ContentNav() {
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

  if (contents.length === 0) {
    return <p className={styles.message}>ページがありません</p>
  }

  return (
    <nav className={styles.nav} aria-label="ページ一覧">
      <ul className={styles.list}>
        {contents.map((content) => {
          const title = content.title?.trim() || UNTITLED
          return (
            <li key={content.id}>
              <NavLink
                to={paths.content.getHref(content.id)}
                className={({ isActive }) =>
                  isActive ? `${styles.item} ${styles.active}` : styles.item
                }
                title={title}
              >
                {title}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
