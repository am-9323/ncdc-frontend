import { clsx } from 'clsx'
import { useState } from 'react'
import cancelIcon from '@/assets/icons/cancel.svg'
import editIcon from '@/assets/icons/edit.svg'
import saveIcon from '@/assets/icons/save.svg'
import Button from '@/components/Button/Button'
import { useUpdateContent } from '@/features/content/api/update-content'
import ContentFieldValue from '@/features/content/components/ContentFieldValue/ContentFieldValue'
import {
  CONTENT_FIELD_RULES,
  validateContentField,
} from '@/features/content/utils/validate-content-field'
import styles from './ContentField.module.scss'

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
  const [isInvalid, setIsInvalid] = useState(false)
  const updateMutation = useUpdateContent()

  const label = LABELS[field]
  const { min, max } = CONTENT_FIELD_RULES[field]

  const handleSave = () => {
    if (draft === null) {
      return
    }
    // 条件を満たさない場合は保存せず、メッセージを表示する
    const isValid = validateContentField(field, draft)
    setIsInvalid(!isValid)
    if (!isValid) {
      updateMutation.reset()
      return
    }
    updateMutation.mutate(
      { id: contentId, [field]: draft },
      { onSuccess: () => setDraft(null) },
    )
  }

  const handleCancel = () => {
    updateMutation.reset()
    setIsInvalid(false)
    setDraft(null)
  }

  return (
    <section
      aria-label={label}
      className={clsx(styles.field, styles[`${field}Field`])}
    >
      <div className={styles.content}>
        <ContentFieldValue
          field={field}
          label={label}
          value={value}
          draft={draft}
          isInvalid={isInvalid}
          onChange={setDraft}
        />
        {isInvalid && (
          <p className={clsx(styles.message, styles.error)} role="alert">
            {label}は{min}〜{max}文字で入力してください
          </p>
        )}
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
