import { Outlet } from 'react-router'
import AppLayout from '@/components/layouts/AppLayout/AppLayout'
import ContentNav from '@/features/content/components/ContentNav/ContentNav'

/** ページ機能の画面に共通のレイアウト。サイドバーにページ一覧を表示する */
export default function ContentLayout() {
  return (
    <AppLayout sidebar={<ContentNav />}>
      <Outlet />
    </AppLayout>
  )
}
