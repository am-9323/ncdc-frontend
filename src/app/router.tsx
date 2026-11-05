import { createBrowserRouter } from 'react-router'
import { paths } from '../config/paths'
import { ContentRoute } from './routes/content'
import { HomeRoute } from './routes/home'
import { NotFoundRoute } from './routes/not-found'
import { RootLayout } from './routes/root'

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
