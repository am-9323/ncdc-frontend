import { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'
import doneIcon from '@/assets/icons/done.svg'
import editIcon from '@/assets/icons/edit.svg'
import plusIcon from '@/assets/icons/plus.svg'
import Button from '@/components/Button/Button'
import { paths } from '@/config/paths'
import { useCreateContent } from '@/features/content/api/create-content'
import { useDeleteContent } from '@/features/content/api/delete-content'
import { useContents } from '@/features/content/api/get-contents'
import ContentList from '@/features/content/components/ContentList/ContentList'
import type { Content } from '@/features/content/types'
import styles from './ContentNav.module.css'

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
  const { data: contents = [] } = useContents()
  const createMutation = useCreateContent()
  const deleteMutation = useDeleteContent()
  const navigate = useNavigate()
  // ContentNav はレイアウト側にあるため、useParams では子ルートの id を取得できない
  const match = useMatch(paths.content.path)
  const selectedId = match ? Number(match?.params.id) : undefined

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
   * @param id - 削除するページの ID
   * @param title - 確認ダイアログに表示するタイトル
   */
  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`「${title}」を削除しますか？`)) {
      return
    }

    const nextContent = findNextContent(contents, id)
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (id !== selectedId) {
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

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <ContentList
          isEditing={isEditing}
          isDeleteDisabled={isMutating}
          onDelete={handleDelete}
        />
      </div>

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
