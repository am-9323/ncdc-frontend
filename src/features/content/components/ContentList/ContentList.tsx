import { clsx } from 'clsx'
import { NavLink } from 'react-router'
import deleteIcon from '@/assets/icons/delete.svg'
import IconButton from '@/components/IconButton/IconButton'
import Spinner from '@/components/Spinner/Spinner'
import { paths } from '@/config/paths'
import { useContents } from '@/features/content/api/get-contents'
import type { Content } from '@/features/content/types'
import styles from './ContentList.module.scss'

const UNTITLED = '無題'

/**
 * サイドバーに表示するタイトルを返す。
 *
 * @param content - 対象のページ
 * @returns 前後の空白を除いたタイトル。`null` や空の場合は「無題」
 */
const getTitle = (content: Content) => content.title?.trim() || UNTITLED

type Props = {
  /** 編集モードの場合は `true`。各ページにゴミ箱を表示する */
  isEditing: boolean
  /** ゴミ箱を押せない状態にする場合は `true` */
  isDeleteDisabled: boolean
  /** ゴミ箱を押したときの処理。ページの ID と一覧に表示中のタイトルを受け取る */
  onDelete: (id: number, title: string) => void
}

/** ページ一覧。取得中・エラー・0 件の場合はメッセージを表示する */
export default function ContentList({
  isEditing,
  isDeleteDisabled,
  onDelete,
}: Props) {
  const { data: contents, isPending, isError } = useContents()

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
        ページ一覧の取得に失敗しました
      </p>
    )
  }

  if (contents.length === 0) {
    return <p className={styles.message}>ページがありません</p>
  }

  return (
    <nav aria-label="ページ一覧">
      <ul className={styles.list}>
        {contents.map((content) => {
          const title = getTitle(content)
          return (
            <li key={content.id} className={styles.row}>
              <NavLink
                to={paths.content.getHref(content.id)}
                className={({ isActive }) =>
                  clsx(styles.item, {
                    [styles.active]: isActive,
                    [styles.editing]: isEditing,
                  })
                }
                title={title}
              >
                {title}
              </NavLink>
              {isEditing && (
                <div className={styles.delete}>
                  <IconButton
                    icon={deleteIcon}
                    label={`${title}を削除`}
                    disabled={isDeleteDisabled}
                    onClick={() => onDelete(content.id, title)}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
