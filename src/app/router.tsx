import { createBrowserRouter } from 'react-router'
import { paths } from '@/config/paths'
import ContentRoute from '@/app/routes/content'
import HomeRoute from '@/app/routes/home'
import NotFoundRoute from '@/app/routes/not-found'
import RootLayout from '@/app/routes/root'

export const router = createBrowserRouter([
  {
    path: paths.root.path,
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: paths.content.path, element: <ContentRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
])
