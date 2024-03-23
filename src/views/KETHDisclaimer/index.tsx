import { FC } from 'react'
import styles from './styles.module.scss'

const KETHDisclaimer: FC = () => {
  return (
    <>
      <div>
        <div className={styles.content}>
          <h1>KETH Protocol Risk Disclaimer</h1>
          <br />
          <p>
            The kETH Protocol (referred to as the &quot;Protocol&quot;) is an automated Liquid
            staking strategy protocol designed to allow users to deposit their Liquid staking
            tokens, commonly known as LST (ERC20 tokens), ETH, or any other whitelisted tokens, into
            the kETH vault contract. This allows the asset to accrue a target ETH-based yield that
            is redeemable in ETH or its equivalent ERC20 form (dETH). The Protocol relies on a
            permissionless programmable Ethereum staking protocol, Stakehouse, to account for and
            manage its underlying staked assets, ensuring the redeemability of ETH returned to
            users. Additionally, it actively rebalances the managed LST&apos;s inventory to achieve
            a consistent target yield rate set by the Protocol.
          </p>
          <br />
          <p>
            The Protocol has been developed and initially implemented by Blockswap Labs
            (&quot;Labs&quot;) and is maintained by Blockswap DAO on behalf of Blockswap Network- a
            decentralized protocol network governed by BSN token holders, with availability on the
            EVM Ethereum Network. Leveraging an optimistic-UTXO mechanism through a unique Registry
            contract architecture, the Protocol ensures maximum public verifiability of its assets
            registered against the Ethereum Validator balance on the Ethereum Consensus layer. This
            mechanism allows users to establish liquid positions for the underlying assets, enabling
            their use for DeFi purposes on Ethereum or other blockchains without compromising
            decentralization or security.
          </p>
          <br />
          <p>
            It is important to note that there is currently one version of the kETH Protocol (v1),
            provided by Labs under a BSL license. A delayed open-source option is available at{' '}
            <a href="https://github.com/stakehouse-dev">https://github.com/stakehouse-dev</a> as a
            set of smart contracts deployed on the Ethereum Blockchain. Users are encouraged to
            review and understand the terms of the license and self-evaluate the risks of the
            provided smart contracts before engaging with the Protocol.
          </p>
          <br />
          <p>
            LST Optimizer App (&quot;dApp&quot;) and protocol are in their beta stage, which means
            that the Protocol, dApp, and all related software, including blockchain software and
            smart contracts, are experimental. The Protocol is highly complex and has dependencies
            with one or more blockchain data; most of its components and functional elements are
            risky, experimental, and first of their kind in the industry. You should not use or
            interact with the Protocol unless you fully understand how it works and the consequences
            of transactions carried out with the use of the Protocol.
          </p>
          <br />
          <p>
            Your use of the kETH protocol involves various risks, including, but not limited to,
            losses while digital assets are being supplied to the Protocol and losses due to the
            staked ETH slashing penalty imposed by the Ethereum Consensus mechanism, Network issues
            between the Execution layer and Consensus layer. Before using the kETH protocol, you
            should review the relevant documentation to make sure you understand how the kETH
            protocol works. Additionally, just as you can access email protocols such as SMTP
            through multiple email clients, you can access the kETH protocol through any web or
            mobile interface that has the capability to interface with Etheruem Blockchain. You are
            responsible for doing your own diligence on those interfaces to understand the fees and
            risks they present.
          </p>
          <br />
          <p>
            AS DESCRIBED IN THE kETH PROTOCOL LICENSES, THE kETH PROTOCOL IS PROVIDED &quot;AS
            IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND. Although Blockswap
            Network Ltd. d/b/a/ &quot;Blockswap Labs&quot; ( &quot;Labs&quot; ) developed much of
            the initial code for the kETH protocol, it does not provide, own, or control the kETH
            protocol, which is run by smart contracts deployed on the Ethereum blockchain. Upgrades
            and modifications to the protocol are managed in a decentralized community-driven way by
            holders of the Blockswap Network governance token &quot;BSN&quot;. No developer or
            entity involved in creating the kETH protocol will be liable for any claims or damages
            whatsoever associated with your use, inability to use, or your interaction with other
            users of, the kETH protocol, including any direct, indirect, incidental, special,
            exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies,
            tokens, or anything else of value.
          </p>
          <br />
          <p>
            Limited Operating History: The Protocol is in its early stages, undergoing continuous
            development with a historical record indicating few or no vulnerabilities. However, it
            may have experienced and reported bugs in the past, and such occurrences could persist
            during and after subsequent development updates. Digital assets held protocols in this
            early stage typically have high challenges, uncertainties, and risks inherent to
            operating a new or early-stage smart contract-based protocol. These risks include but
            are not limited to algorithmic asset strategy capability, limited loss recovery
            mechanisms, insufficient awareness of vulnerabilities associated with listed assets,
            potential adverse competition from more experienced or superior strategy protocols, and
            dependence on a select number of large liquid staking tokens and their respective
            underlying staked asset blockchains, including not limited exposure to proof of stake
            slashings.
          </p>
        </div>
      </div>
    </>
  )
}

export default KETHDisclaimer
