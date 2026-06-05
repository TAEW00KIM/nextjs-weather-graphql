import { getCurrentWeather, getForecast } from '../lib/weatherService';
import { localDate, formatTime, formatDate, formatDatetime, round } from './formatters';

const parseWeather = (w) => ({ description: w[0].description, icon: w[0].icon });

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args).finally(() => cache.delete(key)));
    return cache.get(key);
  };
};
const getForecastCached = memoize(getForecast);

export const resolvers = {
  Query: {
    currentWeather: async (_, { city }) => {
      const [current, forecast] = await Promise.all([
        getCurrentWeather(city),
        getForecastCached(city),
      ]);
      return {
        city: current.name,
        country: current.sys.country,
        population: forecast.city?.population ?? null,
        datetime: formatDatetime(current.dt, current.timezone),
        temp: round(current.main.temp, 2),
        feelsLike: round(current.main.feels_like, 2),
        ...parseWeather(current.weather),
        windSpeed: current.wind.speed,
        humidity: current.main.humidity,
      };
    },

    forecast: async (_, { city }) => {
      const data = await getForecastCached(city);
      const tzOffset = data.city?.timezone ?? 0;

      const grouped = {};
      data.list.forEach((item) => {
        const hour = localDate(item.dt, tzOffset).getUTCHours();
        if (hour < 3 || hour > 21) return;
        const key = formatDate(item.dt, tzOffset);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          datetime: formatTime(item.dt, tzOffset),
          tempMin: round(item.main.temp_min, 1),
          tempMax: round(item.main.temp_max, 1),
          ...parseWeather(item.weather),
          windSpeed: item.wind?.speed ?? null,
          humidity: item.main?.humidity ?? null,
        });
      });

      return Object.entries(grouped).map(([date, slots]) => ({ date, slots }));
    },
  },
};
