import gql from 'graphql-tag'

export const KnotQuery = gql`
  query Knot($account: String!) {
    savETHIndexes(where: { indexOwner: $account }, orderBy: indexId, orderDirection: asc) {
      id
    }
  }
`
export const KnotRewardsQuery = gql`
  query KnotRewards($blsKey: String!) {
    knot(id: $blsKey) {
      totalDETHRewardsReceived
    }
  }
`

export const KnotDepositorQuery = gql`
  query KnotDepositor($blsKey: String!) {
    knot(id: $blsKey) {
      depositor
    }
  }
`

export const IndexOwnerQuery = gql`
  query IndexOwner($account: String!) {
    savETHIndexes(where: { indexOwner: $account }) {
      id
    }
  }
`

export const KnotDetailedQuery = gql`
  query Knot($account: String!) {
    savETHIndexes(where: { indexOwner: $account }, orderBy: indexId, orderDirection: asc) {
      numberOfKnots
      indexId
      indexOwner
      label
      dETHTotal
      dETHTotalRewards
      id
    }
  }
`

export const savETHIndexGlobalQuery = gql`
  query SavETHIndexGlobals {
    savETHIndexGlobals {
      id
    }
  }
`

export const AssistantQuery = gql`
  query getStakehouseRageQuitAssistant($blsKey: String!) {
    stakehouseRageQuitAssistants(where: { blsPublicKey: $blsKey }) {
      id
    }
  }
`

export const sETHTokenAddressQuery = gql`
  query getsETHTokenAddress($stakehouseAddress: String!) {
    stakeHouse(id: $stakehouseAddress) {
      sETH
    }
  }
`
