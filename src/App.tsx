/* eslint-disable no-undef */
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { configureChains, createClient, goerli, mainnet, WagmiConfig } from 'wagmi'
import { SafeConnector } from 'wagmi/connectors/safe'
import { InjectedConnector } from '@wagmi/core'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ApolloProvider } from '@apollo/client'
import { IntercomProvider } from 'react-use-intercom'
import { Buffer } from 'buffer'

import { AuthorizedRoute, ValidatorMustExist, ValidatorMustBeStakehouseMember } from 'routes'
import {
  WalletConnect,
  Details,
  Profile,
  RageQuit,
  MultiPartyRageQuit,
  ValidatorPassword,
  ValidatorRegistration,
  SetupANode,
  DownloadCli,
  CipEncrypt,
  CipDecrypt,
  CipDownload,
  ValidatorRegistrationExpert,
  JoinStakehouse,
  CreateStakehouse,
  RiskDisclaimer,
  KETHDisclaimer,
  GraphqlPlayground,
  TermsPage,
  NotFoundPage
} from 'views'
import { LayoutDashboard } from 'components/layouts'

import UserProvider from 'context/UserContext'
import StakingStoreProvider from 'context/StakingStoreContext'
import BlockswapSDKProvider from 'context/BlockswapSDKContext'
import GraphqlClient from 'graphql/client'
import { rpcUrls, supportedChains } from 'constants/chains'

import './App.css'
import MintStoreProvider from 'context/MintStoreContext'
import GraphqlProvider from 'context/GraphqlContext'
import ExitValidator from 'views/ExitValidator'
import ExitStatus from 'views/ExitStatus'

if (!window.Buffer) {
  window.Buffer = Buffer
}

const { chains: goerliChains, provider: goerliProvider } = configureChains(
  [goerli],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: (rpcUrls as any)[chain.id] }
      }
    })
  ]
)

const { chains: mainnetChains, provider: mainnetProvider } = configureChains(
  [mainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: (rpcUrls as any)[chain.id] }
      }
    })
  ]
)

const chains = process.env.REACT_APP_NETWORK_ID === `${goerli.id}` ? goerliChains : mainnetChains
const provider =
  process.env.REACT_APP_NETWORK_ID === `${goerli.id}` ? goerliProvider : mainnetProvider

const client = createClient({
  autoConnect: false,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        showQrModal: true,
        projectId: `${process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID}`
      }
    }),
    new SafeConnector({
      chains: supportedChains
    })
  ],
  provider: provider as any
})

function App() {
  return (
    <Router>
      <IntercomProvider appId="qggu7t5c" apiBase="https://api-iam.intercom.io" autoBoot>
        <WagmiConfig client={client}>
          <ApolloProvider client={GraphqlClient}>
            <BlockswapSDKProvider>
              <UserProvider>
                <StakingStoreProvider>
                  <MintStoreProvider>
                    <GraphqlProvider>
                      <Routes>
                        <Route
                          path="/graphql-playground/:id/:account"
                          element={<GraphqlPlayground />}
                        />
                        <Route path="/" element={<LayoutDashboard />}>
                          <Route
                            path="exit-validator/:blsKey/status"
                            element={
                              <AuthorizedRoute>
                                <ExitStatus />
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            path="exit-validator/:blsKey"
                            element={
                              <AuthorizedRoute>
                                <ExitValidator />
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            index
                            element={
                              <AuthorizedRoute>
                                <Profile />
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            path="details/:id"
                            element={
                              <AuthorizedRoute>
                                <Details />
                              </AuthorizedRoute>
                            }
                          />
                          <Route path="staking">
                            <Route
                              path="validator-password"
                              element={
                                <AuthorizedRoute>
                                  <ValidatorPassword />
                                </AuthorizedRoute>
                              }
                            />
                            <Route
                              path="validator-registration"
                              element={
                                <AuthorizedRoute>
                                  <ValidatorRegistration />
                                </AuthorizedRoute>
                              }
                            />
                            <Route
                              path="download-cli"
                              element={
                                <AuthorizedRoute>
                                  <DownloadCli />
                                </AuthorizedRoute>
                              }
                            />
                            <Route
                              path="expert-validator-registration"
                              element={
                                <AuthorizedRoute>
                                  <ValidatorRegistrationExpert />
                                </AuthorizedRoute>
                              }
                            />
                            <Route
                              path="final-step"
                              element={
                                <AuthorizedRoute>
                                  <SetupANode />
                                </AuthorizedRoute>
                              }
                            />
                          </Route>
                          <Route path="mint">
                            <Route
                              path=":id"
                              element={
                                <AuthorizedRoute>
                                  <JoinStakehouse />
                                </AuthorizedRoute>
                              }
                            />
                            <Route
                              path=":id/create"
                              element={
                                <AuthorizedRoute>
                                  <CreateStakehouse />
                                </AuthorizedRoute>
                              }
                            />
                          </Route>
                          <Route
                            path="ragequit/:id"
                            element={
                              <AuthorizedRoute>
                                <ValidatorMustExist>
                                  <ValidatorMustBeStakehouseMember>
                                    <RageQuit />
                                  </ValidatorMustBeStakehouseMember>
                                </ValidatorMustExist>
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            path="multiparty-ragequit/:id"
                            element={
                              <AuthorizedRoute>
                                <MultiPartyRageQuit />
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            path="encrypt/:id"
                            element={
                              <AuthorizedRoute>
                                <ValidatorMustExist>
                                  <ValidatorMustBeStakehouseMember>
                                    <CipEncrypt />
                                  </ValidatorMustBeStakehouseMember>
                                </ValidatorMustExist>
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            path="decrypt/:id"
                            element={
                              <AuthorizedRoute>
                                <ValidatorMustExist>
                                  <ValidatorMustBeStakehouseMember>
                                    <CipDecrypt />
                                  </ValidatorMustBeStakehouseMember>
                                </ValidatorMustExist>
                              </AuthorizedRoute>
                            }
                          />
                          <Route
                            path="download-backup/:id"
                            element={
                              <AuthorizedRoute>
                                <ValidatorMustExist>
                                  <ValidatorMustBeStakehouseMember>
                                    <CipDownload />
                                  </ValidatorMustBeStakehouseMember>
                                </ValidatorMustExist>
                              </AuthorizedRoute>
                            }
                          />
                          <Route path="sign-in" element={<WalletConnect />} />
                          <Route path="terms" element={<TermsPage />} />
                          <Route path="riskdisclaimer" element={<RiskDisclaimer />} />
                          <Route path="kethdisclaimer" element={<KETHDisclaimer />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Route>
                      </Routes>
                    </GraphqlProvider>
                  </MintStoreProvider>
                </StakingStoreProvider>
              </UserProvider>
            </BlockswapSDKProvider>
          </ApolloProvider>
        </WagmiConfig>
      </IntercomProvider>
    </Router>
  )
}

export default App
