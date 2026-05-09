import { createFileRoute, Link } from '@tanstack/react-router'
import styles from '../styles/index.module.css';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Pulse.NG</span>
        <h1 className={styles.title}>Track the market with more clarity.</h1>
        <p className={styles.subtitle}>
          A focused stock dashboard for quick symbol discovery, clean profiles, and essential
          metrics in one place.
        </p>
        <div className={styles.actions}>
          <Link to='/dashboard' className={styles.primaryButton}>Open Dashboard</Link>
          <Link to='/trends' className={styles.secondaryButton}>Explore Trends</Link>
        </div>
        <div className={styles.stats}>
          <article className={styles.statCard}>
            <p className={styles.statValue}>20+</p>
            <p className={styles.statLabel}>Active symbols per page</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statValue}>Live-ready</p>
            <p className={styles.statLabel}>Built for rapid market checks</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statValue}>Clean UI</p>
            <p className={styles.statLabel}>Dark mode optimized visuals</p>
          </article>
        </div>
      </div>
    </main>
  )
}
