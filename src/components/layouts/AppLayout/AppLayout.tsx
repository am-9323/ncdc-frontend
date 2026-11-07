import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import closeIcon from '@/assets/icons/close.svg'
import logo from '@/assets/icons/logo.svg'
import menuIcon from '@/assets/icons/menu.svg'
import IconButton from '@/components/IconButton/IconButton'
import styles from './AppLayout.module.css'

type Props = {
  /** サイドバーに表示する内容 */
  sidebar: ReactNode
  /** メインエリアに表示する内容 */
  children: ReactNode
}

/**
 * 画面全体の枠。
 * 狭い画面ではサイドバーを隠し、ヘッダーのメニューボタンからドロワーとして開く。
 */
export default function AppLayout({ sidebar, children }: Props) {
  const { pathname } = useLocation()
  // メニューを開いたときの URL。ページを移動すると一致しなくなり、メニューが閉じる
  const [openedPathname, setOpenedPathname] = useState<string | null>(null)
  const isMenuOpen = openedPathname === pathname

  const closeMenu = () => setOpenedPathname(null)

  const renderLogo = () => (
    <div className={styles.logo}>
      <img src={logo} alt="" width={32} height={32} />
      <span>ServiceName</span>
    </div>
  )

  return (
    <div className={styles.layout}>
      {/* ヘッダーは狭い画面でのみ表示される */}
      <header className={styles.header}>
        <IconButton
          icon={menuIcon}
          label="メニューを開く"
          expanded={isMenuOpen}
          onClick={() => setOpenedPathname(pathname)}
        />
        {renderLogo()}
      </header>

      {isMenuOpen && (
        <div
          className={styles.overlay}
          aria-hidden="true"
          onClick={closeMenu}
        />
      )}
      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          {renderLogo()}
          <div className={styles.close}>
            <IconButton
              icon={closeIcon}
              label="メニューを閉じる"
              onClick={closeMenu}
            />
          </div>
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
