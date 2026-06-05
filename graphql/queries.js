import { gql } from '@apollo/client';

export const GET_CURRENT_WEATHER = gql`
  query GetCurrentWeather($city: String!) {
    currentWeather(city: $city) {
      city
      country
      population
      datetime
      temp
      feelsLike
      description
      icon
      windSpeed
      humidity
    }
  }
`;

export const GET_FORECAST = gql`
  query GetForecast($city: String!) {
    forecast(city: $city) {
      date
      slots {
        datetime
        tempMin
        tempMax
        description
        icon
        windSpeed
        humidity
      }
    }
  }
`;
