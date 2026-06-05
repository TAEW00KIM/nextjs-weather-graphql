import { getCurrentWeather, getForecast } from '../lib/weatherService';
import { localDate, formatTime, formatDate, formatDatetime } from './formatters';

export const resolvers = {
  Query: {
    currentWeather: async (_, { city }) => {
      const [current, forecast] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);
      return {
        city: current.name,
        country: current.sys.country,
        population: forecast.city?.population ?? null,
        datetime: formatDatetime(current.dt, current.timezone),
        temp: Math.round(current.main.temp * 100) / 100,
        feelsLike: Math.round(current.main.feels_like * 100) / 100,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        windSpeed: current.wind.speed,
        humidity: current.main.humidity,
      };
    },

    forecast: async (_, { city }) => {
      const data = await getForecast(city);
      const tzOffset = data.city?.timezone ?? 0;

      const grouped = {};
      data.list.forEach((item) => {
        const hour = localDate(item.dt, tzOffset).getUTCHours();
        if (hour < 3 || hour > 21) return;
        const key = formatDate(item.dt, tzOffset);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          datetime: formatTime(item.dt, tzOffset),
          tempMin: Math.round(item.main.temp_min * 10) / 10,
          tempMax: Math.round(item.main.temp_max * 10) / 10,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind?.speed ?? null,
          humidity: item.main?.humidity ?? null,
        });
      });

      return Object.entries(grouped).map(([date, slots]) => ({ date, slots }));
    },
  },
};
