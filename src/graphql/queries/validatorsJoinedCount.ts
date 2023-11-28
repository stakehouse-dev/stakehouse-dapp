import gql from 'graphql-tag'

export const ValidatorsJoinedCountQuery = gql`
  query ValidatorsJoined($account: String!) {
    stakehouseAccounts(
      where: { lifecycleStatus_gte: 3, depositor: $account, depositorCreatedHouse: false }
    ) {
      id
    }
  }
`
