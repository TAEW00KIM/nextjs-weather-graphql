import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = (uri = '/api/graphql') =>
  new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
  });
