import gql from 'graphql-tag'

export const ValidatorsQuery = gql`
  query Validators($account: String!) {
    stakehouseAccounts(
      where: { lifecycleStatus_gte: 2, depositor: $account }
      orderBy: registerValidatorBlockNumber
      orderDirection: asc
    ) {
      id
      depositTxHash
      lifecycleStatus
      totalDETHMinted
      totalCollateralizedSLOTInVaultFormatted
      totalSLOT
      sETHMinted
      mintFromBlockNumber
      stakeHouseMetadata {
        id
        sETH
        sETHTicker
        sETHExchangeRate
        sETHPayoffRateFormatted
      }
      knotMetadata {
        isPartOfIndex
        savETHIndexId
      }
    }
  }
`

export const getStakehouseAccount = gql`
  query getStakehouseAccount($blsPublicKey: String!) {
    stakehouseAccount(id: $blsPublicKey) {
      stakeHouse
    }
  }
`

export const NodeRunnerByValidatorQuery = gql`
  query nodeRunnerByValidator($address: String!) {
    lsdvalidator(id: $address) {
      smartWallet {
        id
        liquidStakingNetwork {
          id
          feesAndMevPool
          savETHPool
        }
        nodeRunner {
          id
          name
        }
      }
    }
  }
`

export const getStakehouseAccounts = gql`
  query getStakehouseAccounts($blsPublicKeys: [String]!) {
    stakehouseAccounts(where: { id_in: $blsPublicKeys }) {
      stakeHouse
      id
    }
  }
`
