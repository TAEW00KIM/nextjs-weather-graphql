import ForecastDay from '../ForecastDay/ForecastDay';
import styles from './ForecastSection.module.css';

export default function ForecastSection({ days }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>5-day Forecast</h2>
      <div className={styles.list}>
        {days.slice(0, 5).map((day) => (
          <ForecastDay key={day.date} date={day.date} slots={day.slots} />
        ))}
      </div>
    </section>
  );
}
