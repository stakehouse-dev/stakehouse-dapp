import gql from 'graphql-tag'

export const MintableValidatorsQuery = gql`
  query MintableValidators($blockNumber: Int!) {
    stakehouseAccounts(where: { mintFromBlockNumber_lt: $blockNumber }) {
      id
    }
  }
`
