import gql from 'graphql-tag'

export const HousesCreatedCountQuery = gql`
  query HousesCreated($account: String!) {
    stakehouseAccounts(
      where: { lifecycleStatus_gte: 3, depositor: $account, depositorCreatedHouse: true }
    ) {
      id
    }
  }
`
