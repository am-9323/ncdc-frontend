import { useState } from 'react'
import cancelIcon from '@/assets/icons/cancel.svg'
import editIcon from '@/assets/icons/edit.svg'
import saveIcon from '@/assets/icons/save.svg'
import Button from '@/components/Button/Button'
import { useUpdateContent } from '@/features/content/api/update-content'
import ContentFieldValue from '@/features/content/components/ContentFieldValue/ContentFieldValue'
import styles from './ContentField.module.css'

const LABELS = { title: 'タイトル', body: '本文' }

type Props = {
  /** 対象のページの ID */
  contentId: number
  /** 編集する項目 */
  field: 'title' | 'body'
  /** 保存済みの値 */
  value: string
  /** 最初から編集状態で開く場合は `true` */
  initialEditing?: boolean
}

/** タイトルまたは本文の表示と編集。項目ごとに独立して編集・保存できる */
export default function ContentField({
  contentId,
  field,
  value,
  initialEditing = false,
}: Props) {
  // null は編集中でないことを表す
  const [draft, setDraft] = useState(initialEditing ? value : null)
  const updateMutation = useUpdateContent()

  const label = LABELS[field]

  const handleSave = () => {
    if (draft === null) {
      return
    }
    updateMutation.mutate(
      { id: contentId, [field]: draft },
      { onSuccess: () => setDraft(null) },
    )
  }

  const handleCancel = () => {
    updateMutation.reset()
    setDraft(null)
  }

  return (
    <section
      aria-label={label}
      className={`${styles.field} ${styles[`${field}Field`]}`}
    >
      <div className={styles.content}>
        <ContentFieldValue
          field={field}
          label={label}
          value={value}
          draft={draft}
          onChange={setDraft}
        />
        {updateMutation.isError && (
          <p className={styles.message} role="alert">
            {label}の保存に失敗しました
          </p>
        )}
      </div>

      <div className={styles.actions}>
        {draft === null ? (
          <Button
            icon={editIcon}
            label="Edit"
            onClick={() => setDraft(value)}
          />
        ) : (
          <>
            <Button
              variant="normal"
              size="compact"
              icon={cancelIcon}
              label="Cancel"
              disabled={updateMutation.isPending}
              onClick={handleCancel}
            />
            <Button
              size="compact"
              icon={saveIcon}
              label="Save"
              disabled={updateMutation.isPending}
              onClick={handleSave}
            />
          </>
        )}
      </div>
    </section>
  )
}
