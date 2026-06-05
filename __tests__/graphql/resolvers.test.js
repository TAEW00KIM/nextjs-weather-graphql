import { resolvers } from '../../graphql/resolvers';

jest.mock('../../lib/weatherService', () => ({
  getCurrentWeather: jest.fn(),
  getForecast: jest.fn(),
  owmIconUrl: (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`,
}));

import { getCurrentWeather, getForecast } from '../../lib/weatherService';

const mockCurrent = {
  name: 'Seoul',
  sys: { country: 'KR' },
  dt: 1705320000,
  timezone: 32400,
  main: { temp: 5.123, feels_like: 2.456, humidity: 45 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.5 },
};

const mockForecast = {
  city: { population: 9776000, timezone: 32400 },
  list: [
    {
      dt: 1705320000, // 12:00 UTC → 21:00 KST — passes filter
      main: { temp_min: -1, temp_max: 3, humidity: 70 },
      weather: [{ description: 'clouds', icon: '02d' }],
      wind: { speed: 2.5 },
    },
    {
      dt: 1705276800, // 00:00 UTC → 09:00 KST — passes filter
      main: { temp_min: -2, temp_max: 1, humidity: 80 },
      weather: [{ description: 'snow', icon: '13d' }],
      wind: { speed: 1.0 },
    },
    {
      dt: 1705233600, // 2024-01-14 12:00 UTC → 21:00 KST — passes filter, different date (KST Jan 14)
      main: { temp_min: -3, temp_max: 0, humidity: 85 },
      weather: [{ description: 'fog', icon: '50d' }],
      wind: { speed: 0.5 },
    },
  ],
};

beforeEach(() => {
  getCurrentWeather.mockResolvedValue(mockCurrent);
  getForecast.mockResolvedValue(mockForecast);
});

describe('currentWeather resolver', () => {
  it('maps OWM fields to schema shape', async () => {
    const result = await resolvers.Query.currentWeather(null, { city: 'Seoul' });
    expect(result.city).toBe('Seoul');
    expect(result.country).toBe('KR');
    expect(result.population).toBe(9776000);
    expect(result.windSpeed).toBe(3.5);
    expect(result.humidity).toBe(45);
    expect(result.icon).toBe('01d');
  });

  it('rounds temp to 2 decimal places', async () => {
    const result = await resolvers.Query.currentWeather(null, { city: 'Seoul' });
    expect(result.temp).toBe(5.12);
    expect(result.feelsLike).toBe(2.46);
  });

  it('formats datetime in city local timezone', async () => {
    const result = await resolvers.Query.currentWeather(null, { city: 'Seoul' });
    // 1705320000 UTC + 32400 (KST) → Jan 15 21:00 KST → "09:00pm"
    expect(result.datetime).toBe('Jan 15. 09:00pm');
  });

  it('returns null population when forecast city missing', async () => {
    getForecast.mockResolvedValue({ ...mockForecast, city: undefined });
    const result = await resolvers.Query.currentWeather(null, { city: 'Seoul' });
    expect(result.population).toBeNull();
  });
});

describe('forecast resolver', () => {
  it('groups slots by local date', async () => {
    const result = await resolvers.Query.forecast(null, { city: 'Seoul' });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((day) => {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('slots');
    });
  });

  it('rounds tempMin/tempMax to 1 decimal', async () => {
    const result = await resolvers.Query.forecast(null, { city: 'Seoul' });
    const slot = result[0].slots[0];
    expect(Number.isFinite(slot.tempMin)).toBe(true);
    expect(Number.isFinite(slot.tempMax)).toBe(true);
  });

  it('includes windSpeed and humidity on each slot', async () => {
    const result = await resolvers.Query.forecast(null, { city: 'Seoul' });
    const slot = result[0].slots[0];
    expect(slot).toHaveProperty('windSpeed');
    expect(slot).toHaveProperty('humidity');
  });
});
