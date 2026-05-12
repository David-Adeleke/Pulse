import { Link } from '@tanstack/react-router';
import styles from '../styles/placeholder.module.css';

// Reusable placeholder page for features that are not released yet.
export default function ComingSoon({ title, description }) {
  return (
    // Full-page centered wrapper.
    <main className={styles.page}>
      {/* Card container with the provided heading/body copy. */}
      <section className={styles.card}>
        {/* Small status label. */}
        <span className={styles.kicker}>Coming soon</span>
        {/* Feature title passed by the route. */}
        <h1 className={styles.title}>{title}</h1>
        {/* Feature description passed by the route. */}
        <p className={styles.description}>{description}</p>
        {/* Quick actions to navigate to existing pages. */}
        <div className={styles.actions}>
          <Link to='/dashboard' className={styles.primaryButton}>Back to Dashboard</Link>
          <Link to='/trends' className={styles.secondaryButton}>Explore Trends</Link>
        </div>
      </section>
    </main>
  );
}
