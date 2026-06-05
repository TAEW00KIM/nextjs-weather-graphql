import { render, screen } from '@testing-library/react';
import CurrentWeatherCard from '../../components/CurrentWeatherCard/CurrentWeatherCard';

const mockWeather = {
  city: 'Seoul',
  country: 'KR',
  population: 9776000,
  datetime: 'Jan 15. 09:00pm',
  temp: 5.12,
  feelsLike: 2.46,
  description: 'clear sky',
  icon: '01d',
  windSpeed: 3.5,
  humidity: 45,
};

describe('CurrentWeatherCard', () => {
  it('renders city and country', () => {
    render(<CurrentWeatherCard weather={mockWeather} />);
    expect(screen.getByText('Seoul, KR')).toBeInTheDocument();
  });

  it('renders temperature', () => {
    render(<CurrentWeatherCard weather={mockWeather} />);
    expect(screen.getByText('5.12℃')).toBeInTheDocument();
  });

  it('renders datetime', () => {
    render(<CurrentWeatherCard weather={mockWeather} />);
    expect(screen.getByText('Jan 15. 09:00pm')).toBeInTheDocument();
  });

  it('renders population when present', () => {
    render(<CurrentWeatherCard weather={mockWeather} />);
    expect(screen.getByText(/9,776,000/)).toBeInTheDocument();
  });

  it('hides population when null', () => {
    render(<CurrentWeatherCard weather={{ ...mockWeather, population: null }} />);
    expect(screen.queryByText(/인구수/)).not.toBeInTheDocument();
  });

  it('renders weather icon', () => {
    render(<CurrentWeatherCard weather={mockWeather} />);
    const img = screen.getByAltText('clear sky');
    expect(img).toHaveAttribute('src', expect.stringContaining('01d'));
  });
});
