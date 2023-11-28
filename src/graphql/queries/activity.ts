import gql from 'graphql-tag'

export const ActivityQuery = gql`
  query Activity($account: String!) {
    events(
      where: {
        key_in: [
          "INITIALS_REGISTERED"
          "DEPOSIT_REGISTERED"
          "NEW_HOUSE_MEMBER"
          "NEW_STAKEHOUSE_REGISTRY_DEPLOYED"
          "DETH_WITHDRAWN_INTO_OPEN_MARKET"
          "RAGE_QUIT"
          "KNOT_INSERTED_INTO_INDEX"
          "SIGNING_KEY_RE_ENCRYPTION"
          "SLOT_SLASHED"
          "DETH_REWARDS_MINTED"
        ]
        from: $account
      }
      orderBy: blockNumber
      orderDirection: desc
    ) {
      id
      key
      value
      blsPubKeyForKnot
      blockNumber
    }
  }
`
