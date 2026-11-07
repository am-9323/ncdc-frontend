import type { ReactNode } from 'react'
import logo from '@/assets/icons/logo.svg'
import styles from './AppLayout.module.css'

type Props = {
  sidebar: ReactNode
  children: ReactNode
}

/** 画面全体の枠 */
export default function AppLayout({ sidebar, children }: Props) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={logo} alt="" width={32} height={32} />
          <span>ServiceName</span>
        </div>
        {sidebar}
      </aside>
      <div className={styles.body}>
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <small>Copyright © 2021 Sample</small>
          <a href="#">運営会社</a>
        </footer>
      </div>
    </div>
  )
}
