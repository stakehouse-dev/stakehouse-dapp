import gql from 'graphql-tag'

export const ValidatorsCreatedCountQuery = gql`
  query ValidatorsCreated($account: String!) {
    stakehouseAccounts(where: { lifecycleStatus_gte: 2, depositor: $account }) {
      id
    }
  }
`
