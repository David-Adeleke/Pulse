import { createFileRoute, Link } from '@tanstack/react-router'
import styles from '../styles/index.module.css';

// Landing page route.
export const Route = createFileRoute('/')({
  component: RouteComponent,
})

// Public home page with key messaging and CTA links.
function RouteComponent() {
  return (
    // Full-screen centered landing layout.
    <main className={styles.page}>
      {/* Main hero content block. */}
      <div className={styles.hero}>
        {/* Eyebrow brand label. */}
        <span className={styles.eyebrow}>Pulse.NG</span>
        {/* Primary marketing headline. */}
        <h1 className={styles.title}>Track the market with more clarity.</h1>
        {/* Supporting subtitle text. */}
        <p className={styles.subtitle}>
          A focused stock dashboard for quick symbol discovery, clean profiles, and essential
          metrics in one place.
        </p>
        {/* Action links to primary app routes. */}
        <div className={styles.actions}>
          <Link to='/dashboard' className={styles.primaryButton}>Open Dashboard</Link>
          <Link to='/trends' className={styles.secondaryButton}>Explore Trends</Link>
        </div>
        {/* Three high-level product value cards. */}
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
