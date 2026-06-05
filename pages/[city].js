import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { GET_CURRENT_WEATHER, GET_FORECAST } from "../graphql/queries";
import { createApolloClient } from "../lib/apolloClient";
import { CITIES } from "../lib/cities";
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

export async function getServerSideProps({ params, req }) {
  const { city } = params;

  if (!CITIES.includes(city)) {
    return { notFound: true };
  }

  const protocol = req.headers["x-forwarded-proto"] ?? "http";
  const host = req.headers.host;
  const client = createApolloClient(`${protocol}://${host}/api/graphql`);

  try {
    const [weatherResult, forecastResult] = await Promise.all([
      client.query({ query: GET_CURRENT_WEATHER, variables: { city } }),
      client.query({ query: GET_FORECAST, variables: { city } }),
    ]);

    return {
      props: {
        currentWeather: weatherResult.data.currentWeather,
        forecast: forecastResult.data.forecast,
        city,
      },
    };
  } catch (err) {
    console.error("Failed to fetch weather data:", err.message);
    return { notFound: true };
  }
}
