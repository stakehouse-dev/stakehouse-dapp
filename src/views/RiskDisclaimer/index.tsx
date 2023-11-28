import { FC } from 'react'
import styles from './styles.module.scss'

const RiskDisclaimer: FC = () => {
  return (
    <>
      <div>
        <div className={styles.content}>
          <h1>Stakehouse protocol risk disclaimer</h1>
          <br />
          <p>
            The Stakehouse Protocol (the &quot;Protocol&quot;) is a decentralized cross-chain
            protocol that enables permissionless programmable Ethereum staking using Ethereum
            Deposit Contract and liquidity abstraction from their validator balances; the protocol
            is developed and provided by Blockswap Labs (&quot;Labs&quot;). The Protocol leverages
            an optimistic UTXO mechanism through a Registry contract architecture to ensure maximum
            public verifiability of its assets registered against the Ethereum Validator balance on
            the Ethereum Consensus layer by a user to enable liquid positions for the underlying
            assets to use for DeFi purposes on Ethereum or other Blockchains without sacrificing
            decentralization or security. There is currently one version of the Stakehouse protocol
            (v1), provided by Labs under a BSL license with a delayed open source option available (
            {''}
            <a href="https://github.com/stakehouse-dev">https://github.com/stakehouse-dev</a>
            {''} ) as a set of smart contracts that are deployed on the Ethereum Blockchain.
          </p>
          <br />
          <p>
            Stakehouse App (&quot;dApp&quot;) and protocol are in their beta stage, which means that
            the Protocol, dApp, and all related software, including blockchain software and smart
            contracts, are experimental. The Protocol is highly complex and has dependencies with
            one or more blockchain data; most of its components and functional elements are risky,
            experimental, and first of their kind in the industry. You should not use or interact
            with the Protocol unless you fully understand how it works and the consequences of
            transactions carried out with the use of the Protocol.
          </p>
          <br />
          <p>
            Your use of the Stakehouse protocol involves various risks, including, but not limited
            to, losses while digital assets are being supplied to the Protocol and losses due to the
            staked ETH slashing penalty imposed by the Ethereum Consensus mechanism, Network issues
            between the Execution layer and Consensus layer. Before using the Stakehouse protocol,
            you should review the relevant documentation to make sure you understand how the
            Stakehouse protocol works. Additionally, just as you can access email protocols such as
            SMTP through multiple email clients, you can access the Stakehouse protocol through any
            web or mobile interface that has the capability to interface with Etheruem Blockchain.
            You are responsible for doing your own diligence on those interfaces to understand the
            fees and risks they present.
          </p>
          <br />
          <p>
            AS DESCRIBED IN THE STAKEHOUSE PROTOCOL LICENSES, THE STAKEHOUSE PROTOCOL IS PROVIDED
            &quot;AS IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND. Although
            Blockswap Network Ltd. d/b/a/ &quot;Blockswap Labs&quot; ( &quot;Labs&quot; ) developed
            much of the initial code for the Stakehouse protocol, it does not provide, own, or
            control the Stakehouse protocol, which is run by smart contracts deployed on the
            Ethereum blockchain. Upgrades and modifications to the protocol are managed in a
            decentralized community-driven way by holders of the Blockswap Network governance token
            &quot;BSN&quot;. No developer or entity involved in creating the Stakehouse protocol
            will be liable for any claims or damages whatsoever associated with your use, inability
            to use, or your interaction with other users of, the Stakehouse protocol, including any
            direct, indirect, incidental, special, exemplary, punitive or consequential damages, or
            loss of profits, cryptocurrencies, tokens, or anything else of value.
          </p>
        </div>
      </div>
    </>
  )
}

export default RiskDisclaimer
