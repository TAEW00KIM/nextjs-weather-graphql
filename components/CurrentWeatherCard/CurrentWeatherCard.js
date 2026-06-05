import Image from 'next/image';
import { owmIconUrl } from '../../lib/weatherService';
import styles from './CurrentWeatherCard.module.css';

export default function CurrentWeatherCard({ weather }) {
  const { city, country, population, datetime, temp, feelsLike, description, icon, windSpeed, humidity } = weather;

  return (
    <section className={styles.card}>
      <div className={styles.left}>
        <div className={styles.iconCircle}>
          <Image
            src={owmIconUrl(icon)}
            alt={description}
            width={50}
            height={50}
          />
        </div>
        <div className={styles.cityInfo}>
          <time className={styles.datetime}>{datetime}</time>
          <div className={styles.cityBlock}>
            <p className={styles.cityName}>{city}, {country}</p>
            {population != null && (
              <span className={styles.population}>(인구수 : {population.toLocaleString()})</span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <strong className={styles.temp}>{temp}℃</strong>
        <p className={styles.meta}>
          Feels like {feelsLike}℃ {description}<br />
          풍속 {windSpeed}m/s 습도 {humidity}%
        </p>
      </div>
    </section>
  );
}
