const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const owmFetch = async (endpoint) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENWEATHER_API_KEY가 .env.local에 설정되어 있지 않습니다. .env.example을 참고해 키를 등록하세요.'
    );
  }
  const res = await fetch(`${BASE_URL}/${endpoint}&appid=${apiKey}`);
  if (!res.ok) throw new Error(`OWM API error: ${res.status}`);
  return res.json();
};

export const getCurrentWeather = (city) =>
  owmFetch(`weather?q=${encodeURIComponent(city)}&units=metric`);

export const getForecast = (city) =>
  owmFetch(`forecast?q=${encodeURIComponent(city)}&units=metric`);

export const owmIconUrl = (icon) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;
