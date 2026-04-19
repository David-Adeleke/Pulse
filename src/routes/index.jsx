import { createFileRoute, Link } from '@tanstack/react-router'
import styles from '../styles/index.module.css';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className={styles['body-container']}>
        <div className={styles['hero-container']}>
          <h1 className={styles['hero-text']}>Welcome to PulseNG</h1>
          <p className={styles['hero-subtext']}>The stock market, at a glance</p>
          <small className={styles['hero-small']}>Clean dashboard and the insights that matter, built for investors tracking the market.</small>
          <Link to='/dashboard'>Go to Dashboard</Link>
        </div>
      </div>
    </>
  )
}
