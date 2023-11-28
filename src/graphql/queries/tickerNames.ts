import gql from 'graphql-tag'

export const TickerNamesQuery = gql`
  query TickerNames {
    stakeHouses {
      id
      sETHTicker
      foundedBrandId
    }
  }
`
