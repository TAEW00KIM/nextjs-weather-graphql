import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type CurrentWeather {
    city: String!
    country: String!
    population: Int
    datetime: String!
    temp: Float!
    feelsLike: Float!
    description: String!
    icon: String!
    windSpeed: Float!
    humidity: Int!
  }

  type ForecastSlot {
    datetime: String!
    tempMin: Float!
    tempMax: Float!
    description: String!
    icon: String!
    windSpeed: Float
    humidity: Int
  }

  type ForecastDay {
    date: String!
    slots: [ForecastSlot!]!
  }

  type Query {
    currentWeather(city: String!): CurrentWeather!
    forecast(city: String!): [ForecastDay!]!
  }
`;
