import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CITIES } from "../lib/cities";
import { resolvers } from "../graphql/resolvers";
import CurrentWeatherCard from "../components/CurrentWeatherCard/CurrentWeatherCard";
import styles from "../styles/City.module.css";

const ForecastSection = dynamic(
  () => import("../components/ForecastSection/ForecastSection"),
  {
    ssr: false,
    loading: () => <p className={styles.loading}>Loading forecast...</p>,
  },
);

export default function CityPage({ currentWeather, forecast, city }) {
  return (
    <>
      <Head>
        <title>{`Weather in ${city} — Weather App`}</title>
        <meta
          name="description"
          content={`Current weather and 5-day forecast for ${city}`}
        />
        <link rel="icon" href="/earth.png" />
      </Head>
      <main className={styles.main}>
        <div className={`layout-container ${styles.wrapper}`}>
          <article className={styles.card}>
            <header className={styles.cardHeader}>
              <Link href="/" className={styles.globeIcon}>
                <Image
                  src="/earth.png"
                  alt="홈으로"
                  width={68}
                  height={51}
                  priority
                />
              </Link>
              <h1 className={styles.title}>Weather Information for {city}</h1>
            </header>
            <CurrentWeatherCard weather={currentWeather} />
            <ForecastSection days={forecast} />
          </article>
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: CITIES.map((city) => ({ params: { city } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { city } = params;

  try {
    const [currentWeather, forecast] = await Promise.all([
      resolvers.Query.currentWeather(null, { city }),
      resolvers.Query.forecast(null, { city }),
    ]);

    return {
      props: { currentWeather, forecast, city },
      revalidate: 600,
    };
  } catch (err) {
    console.error("Failed to fetch weather data:", err.message);
    return { notFound: true };
  }
}
