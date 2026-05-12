import styles from '../styles/loader.module.css'

// Full-screen loading overlay shown while route transitions are pending.
export default function Loader() {
  return (
    // Overlay covers the entire viewport and centers the spinner.
    <div className={styles.overlay}>
      {/* Spinner ring used as the main loading indicator. */}
      <div className={styles.spinner}>
        {/* Brand text inside the spinner. */}
        <h1 className={styles.text}>Pulse.NG</h1>
      </div>
    </div>
  )
}
