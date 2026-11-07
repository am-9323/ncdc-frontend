import { createBrowserRouter } from 'react-router'
import { paths } from '@/config/paths'
import ContentRoute from '@/app/routes/content'
import ContentLayout from '@/app/routes/content-layout'
import HomeRoute from '@/app/routes/home'
import NotFoundRoute from '@/app/routes/not-found'

export const router = createBrowserRouter([
  {
    path: paths.root.path,
    children: [
      {
        // URL を持たないレイアウトルート。ページ機能の画面をまとめ、同じサイドバーを表示する
        element: <ContentLayout />,
        children: [
          { index: true, element: <HomeRoute /> },
          { path: paths.content.path, element: <ContentRoute /> },
          { path: '*', element: <NotFoundRoute /> },
        ],
      },
    ],
  },
])
