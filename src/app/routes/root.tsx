import { Outlet } from 'react-router'
import { AppLayout } from '../../components/layouts/AppLayout/AppLayout'

export function RootLayout() {
  return (
    <AppLayout sidebar={null}>
      <Outlet />
    </AppLayout>
  )
}
