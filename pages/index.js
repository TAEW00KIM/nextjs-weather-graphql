import Head from "next/head";
import Image from "next/image";
import CityButton from "../components/CityButton/CityButton";
import styles from "../styles/Home.module.css";
import { CITIES } from "../lib/cities";

export default function Home() {
  return (
    <>
      <Head>
        <title>Weather App</title>
        <meta
          name="description"
          content="Check weather for major cities worldwide"
        />
        <link rel="icon" href="/earth.png" />
      </Head>
      <main className={styles.main}>
        <div className={`layout-container ${styles.inner}`}>
          <h1 className={styles.title}>
            Welcome to
            <br />
            <span className={styles.highlight}>Weather App!</span>
          </h1>
          <p className={styles.subtitle}>
            Choose a city from the list below to check the weather.
          </p>
          <nav className={styles.cityList} aria-label="City selection">
            {CITIES.map((city) => (
              <CityButton key={city} city={city} />
            ))}
          </nav>
        </div>
        <div className={styles.globeWrapper}>
          <Image
            src="/earth.png"
            alt="Earth"
            width={430}
            height={321}
            priority
          />
        </div>
      </main>
    </>
  );
}
