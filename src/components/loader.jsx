import styles from '../styles/loader.module.css'

export default function Loader() {
    return (
        <div className={styles.overlay}>
            <div className={styles.spinner}>
                <h1 className={styles.text}>Pulse.NG</h1>
            </div>
        </div>
    )
}