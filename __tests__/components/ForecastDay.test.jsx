import { render, screen, fireEvent } from '@testing-library/react';
import ForecastDay from '../../components/ForecastDay/ForecastDay';

const mockSlots = [
  {
    datetime: '03:00am',
    tempMin: -1,
    tempMax: 2,
    description: 'clouds',
    icon: '02d',
    windSpeed: 3,
    humidity: 70,
  },
  {
    datetime: '06:00am',
    tempMin: 0,
    tempMax: 3,
    description: 'clear sky',
    icon: '01d',
    windSpeed: 2,
    humidity: 65,
  },
];

describe('ForecastDay', () => {
  it('renders date in header', () => {
    render(<ForecastDay date="Jan 15" slots={mockSlots} />);
    expect(screen.getByText('Jan 15')).toBeInTheDocument();
  });

  it('hides slots by default', () => {
    render(<ForecastDay date="Jan 15" slots={mockSlots} />);
    expect(screen.queryByText('03:00am')).not.toBeInTheDocument();
  });

  it('shows slots after clicking header', () => {
    render(<ForecastDay date="Jan 15" slots={mockSlots} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('03:00am')).toBeInTheDocument();
    expect(screen.getByText('06:00am')).toBeInTheDocument();
  });

  it('hides slots again on second click', () => {
    render(<ForecastDay date="Jan 15" slots={mockSlots} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('03:00am')).not.toBeInTheDocument();
  });

  it('sets aria-expanded correctly', () => {
    render(<ForecastDay date="Jan 15" slots={mockSlots} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders slot temperatures', () => {
    render(<ForecastDay date="Jan 15" slots={mockSlots} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('-1℃ / 2℃')).toBeInTheDocument();
  });
});
