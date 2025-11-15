import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const PHP_GRAPHQL_ENDPOINT = 'https://digmstudents.westphal.drexel.edu/~ojk25/graphql/index.php';

const httpLink = new HttpLink({
  uri: PHP_GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
