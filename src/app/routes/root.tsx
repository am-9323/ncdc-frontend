import { Outlet } from 'react-router'
import AppLayout from '@/components/layouts/AppLayout/AppLayout'
import ContentNav from '@/features/content/components/ContentNav/ContentNav'

/** 全画面共通のレイアウト */
export default function RootLayout() {
  return (
    <AppLayout sidebar={<ContentNav />}>
      <Outlet />
    </AppLayout>
  )
}
