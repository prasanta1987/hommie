import styles from './LoadingSpinner.module.css';

export default function Loading() {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinner}></div>
    </div>
  );
}

