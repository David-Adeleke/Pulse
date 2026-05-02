import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import styles from '../styles/logo.module.css'

export default function Logo() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles['logo-navbar']}>
      <div className={styles.logo}>
        <Link to='/'><h1>PULSE.NG</h1></Link>
      </div>

      <button
        className={`${styles.hamburger} ${open ? styles.open : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`${styles['navbar-container']} ${open ? styles.open : ''}`}
        onClick={() => setOpen(!open)}>
        <ul className={styles.navbar}>
          <Link to='/dashboard' onClick={() => setOpen(false)}><li>Home</li></Link>
          <Link to='/portfolios' onClick={() => setOpen(false)}><li>Portfolios</li></Link>
          <Link to='/trends' onClick={() => setOpen(false)}><li>Market Trends</li></Link>
          <Link to='/watchlist' onClick={() => setOpen(false)}><li>Watchlist</li></Link>
        </ul>
      </div>
    </div>
  )
}