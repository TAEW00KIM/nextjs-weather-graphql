import Link from 'next/link';
import styles from './CityButton.module.css';

export default function CityButton({ city }) {
  return (
    <Link href={`/${city}`} passHref>
      <a className={styles.button}>{city}</a>
    </Link>
  );
}
