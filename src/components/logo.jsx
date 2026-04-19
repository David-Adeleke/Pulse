import { Link } from '@tanstack/react-router';
import styles from "../styles/logo.module.css"

export default function Logo() {
  return (
    <div className={styles['logo-navbar']}>
      <div className={styles.logo}>
        <Link to='/'>
          <h1>PULSE.NG</h1>
        </Link>
      </div>

      <div className={styles['navbar-container']}>
        <ul className={styles.navbar}>
          <Link to='/dashboard'><li>Home</li></Link>
          <Link to='/portfolios'><li>Portfolios</li></Link>
          <Link to='/trends'><li>Market Trends</li></Link>
          <Link to='/watchlist'><li>Watchlist</li></Link>
        </ul>
      </div>
    </div>
  )
}