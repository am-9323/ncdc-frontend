import { useState } from 'react'
import { NavLink, useMatch, useNavigate } from 'react-router'
import deleteIcon from '@/assets/icons/delete.svg'
import doneIcon from '@/assets/icons/done.svg'
import editIcon from '@/assets/icons/edit.svg'
import plusIcon from '@/assets/icons/plus.svg'
import Button from '@/components/Button/Button'
import IconButton from '@/components/IconButton/IconButton'
import { paths } from '@/config/paths'
import { useCreateContent } from '@/features/content/api/create-content'
import { useDeleteContent } from '@/features/content/api/delete-content'
import { useContents } from '@/features/content/api/get-contents'
import type { Content } from '@/features/content/types'
import styles from './ContentNav.module.css'

const UNTITLED = '無題'

/**
 * サイドバーに表示するタイトルを返す。
 *
 * @param content - 対象のページ
 * @returns 前後の空白を除いたタイトル。`null` や空の場合は「無題」
 */
const getTitle = (content: Content) => content.title?.trim() || UNTITLED

/**
 * 削除後に選択するページを返す。
 *
 * @param contents - 削除前のページ一覧
 * @param id - 削除するページの ID
 * @returns 次のページ。末尾なら前のページ、ほかにページがなければ `undefined`
 */
const findNextContent = (contents: Content[], id: number) => {
  const index = contents.findIndex((content) => content.id === id)
  return contents[index + 1] ?? contents[index - 1]
}

export default function ContentNav() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: contents, isPending, isError } = useContents()
  const createMutation = useCreateContent()
  const deleteMutation = useDeleteContent()
  const navigate = useNavigate()
  // ContentNav はレイアウト側にあるため、useParams では子ルートの id を取得できない
  const selectedId = Number(useMatch(paths.content.path)?.params.id)

  const isMutating = createMutation.isPending || deleteMutation.isPending

  /** ページを作成し、成功したら作成したページへ遷移する */
  const handleCreate = () => {
    createMutation.mutate(undefined, {
      onSuccess: (created) => navigate(paths.content.getHref(created.id)),
    })
  }

  /**
   * 確認ダイアログで OK が押されたらページを削除する。
   * 選択中のページを削除した場合は、次のページかトップ画面へ遷移する。
   *
   * @param content - 削除するページ
   * @param currentContents - 削除前のページ一覧
   */
  const handleDelete = (content: Content, currentContents: Content[]) => {
    if (!window.confirm(`「${getTitle(content)}」を削除しますか？`)) {
      return
    }

    const nextContent = findNextContent(currentContents, content.id)
    deleteMutation.mutate(content.id, {
      onSuccess: () => {
        if (content.id !== selectedId) {
          return
        }
        navigate(
          nextContent
            ? paths.content.getHref(nextContent.id)
            : paths.root.getHref(),
        )
      },
    })
  }

  const renderList = () => {
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
      <nav aria-label="ページ一覧">
        <ul className={styles.list}>
          {contents.map((content) => {
            const title = getTitle(content)
            return (
              <li key={content.id} className={styles.row}>
                <NavLink
                  to={paths.content.getHref(content.id)}
                  className={({ isActive }) =>
                    [
                      styles.item,
                      isActive && styles.active,
                      isEditing && styles.editing,
                    ]
                      .filter(Boolean)
                      .join(' ')
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
                      disabled={isMutating}
                      onClick={() => handleDelete(content, contents)}
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

  return (
    <div className={styles.root}>
      <div className={styles.body}>{renderList()}</div>

      {createMutation.isError && (
        <p className={styles.message} role="alert">
          ページの作成に失敗しました
        </p>
      )}
      {deleteMutation.isError && (
        <p className={styles.message} role="alert">
          ページの削除に失敗しました
        </p>
      )}

      <div className={styles.actions}>
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              icon={plusIcon}
              label="New page"
              disabled={isMutating}
              onClick={handleCreate}
            />
            <Button
              icon={doneIcon}
              label="Done"
              onClick={() => setIsEditing(false)}
            />
          </>
        ) : (
          <Button
            icon={editIcon}
            label="Edit"
            onClick={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  )
}
