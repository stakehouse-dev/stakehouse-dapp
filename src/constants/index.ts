export enum NETWORK {
  TESTNET = 'Goerli',
  MAINNET = 'Mainnet'
}

export const API_ENDPOINT = {
  [NETWORK.TESTNET]: 'https://fq31s5p6ij.execute-api.eu-central-1.amazonaws.com/goerli',
  [NETWORK.MAINNET]: 'https://kyd9gxliq3.execute-api.eu-central-1.amazonaws.com/mainnet'
}
