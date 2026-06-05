import { useState } from 'react';
import Image from 'next/image';
import { owmIconUrl } from '../../lib/weatherService';
import styles from './ForecastDay.module.css';

export default function ForecastDay({ date, slots }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.day}>
      <button
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.date}>{date}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul className={styles.slots}>
          {slots.map((slot, i) => (
            <li key={i} className={styles.slot}>
              <div className={styles.slotLeft}>
                <span className={styles.iconCircle}>
                  <Image
                    src={owmIconUrl(slot.icon)}
                    alt={slot.description}
                    width={36}
                    height={36}
                  />
                </span>
                <time className={styles.time}>{slot.datetime}</time>
              </div>
              <div className={styles.slotRight}>
                <span className={styles.slotDesc}>{slot.description}</span>
                <strong className={styles.slotTemp}>
                  {slot.tempMin}℃ / {slot.tempMax}℃
                </strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
