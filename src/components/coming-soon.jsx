import { Link } from '@tanstack/react-router';
import styles from '../styles/placeholder.module.css';

export default function ComingSoon({ title, description }) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.kicker}>Coming soon</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Link to='/dashboard' className={styles.primaryButton}>Back to Dashboard</Link>
          <Link to='/trends' className={styles.secondaryButton}>Explore Trends</Link>
        </div>
      </section>
    </main>
  );
}
