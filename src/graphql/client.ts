import { ApolloClient, InMemoryCache } from '@apollo/client'
import { config } from 'constants/environment'

const client = new ApolloClient({
  uri: config.GRAPHQL_URL,
  cache: new InMemoryCache()
})

export default client
