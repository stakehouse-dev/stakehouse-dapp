import { FC, useContext, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ModalConfirmMint, ModalNameInvalid } from 'components/app'
import { Button, ComboMenu, Spinner, Tooltip } from 'components/shared'

import { BlockswapSDKContext } from 'context/BlockswapSDKContext'
import { notifyHash, noty } from 'utils/global'
import { BEACON_NODE_URL } from 'constants/chains'
import { BalanceReportT, TMenu } from 'types'
import { useNetworkBasedLinkFactories, useUser } from 'hooks'

import { ReactComponent as ETHBigIcon } from 'assets/images/icon-eth-bigs.svg'
import { ReactComponent as TopRightGreenIcon } from 'assets/images/icon-arrow-top-right-green.svg'
import styles from './styles.module.scss'
import { ethers } from 'ethers'

const reversedNameArr = [
  'algo',
  'apy',
  'bank',
  'bat',
  'bayc',
  'block',
  'bnp',
  'bull',
  'chain',
  'coin',
  'dao',
  'dapp',
  'dot',
  'dva',
  'earn',
  'elev',
  'eth',
  'farm',
  'fish',
  'lend',
  'meme',
  'moon',
  'nft',
  'node',
  'nstar',
  'one',
  'plebs',
  'rekt',
  'save',
  'share',
  'terra',
  'token',
  'yield',
  'zeus',
  'bsn',
  'cbsn',
  'dart',
  'saver',
  'stake',
  'house',
  'poly',
  'wolf',
  'elevt',
  'mynt',
  'club',
  'impfi',
  'colab',
  'cland'
]

interface IProps {
  minted: boolean
  setMinted: (val: boolean) => void
}

const CreateStakehouseContent: FC<IProps> = ({ minted, setMinted }) => {
  const { id: blsPublicKey } = useParams()
  const navigate = useNavigate()
  const { sdk } = useContext(BlockswapSDKContext)
  const { refetchUserData, userAddress, validators } = useUser()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isWithdrawing, setWithdrawing] = useState(false)
  const [signature, setSignature] = useState<BalanceReportT>()
  const [showMintModal, setShowMintModal] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [tickerName, setTickerName] = useState('')
  const [mintTxHash, setMintTxHash] = useState('')

  const handleSubmit = async () => {
    if (!tickerName) {
      setShowValidation(true)
      return
    }

    if (!sdk) {
      return
    }

    try {
      setSubmitting(true)
      const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
        BEACON_NODE_URL,
        blsPublicKey
      )
      const authenticateReportResult: BalanceReportT = await sdk.balanceReport.authenticateReport(
        BEACON_NODE_URL,
        finalisedEpochReport
      )
      if (!authenticateReportResult?.report) {
        setSubmitted(false)
        noty((authenticateReportResult as any).message || authenticateReportResult)
      } else {
        setSignature(authenticateReportResult)
        setSubmitted(true)
      }
    } catch (err: any) {
      console.log('err: ', err)
      noty(err.message || err)
    }

    setSubmitting(false)
  }
  const handleMint = () => {
    setShowMintModal(true)
  }
  const handleGoNextStep = async (hash: string) => {
    setMintTxHash(hash)
    await refetchUserData()
    setShowMintModal(false)
    setMinted(true)
  }

  const handleWithdrawDEth = async () => {
    if (!sdk) return

    const selectedValidator = validators.find((v) => v.id === blsPublicKey)
    let stakehouseAddress = ''
    if (!selectedValidator) return
    if (!selectedValidator.stakeHouseMetadata) {
      stakehouseAddress = await sdk.utils.getStakehouse(blsPublicKey)
      if (stakehouseAddress == ethers.constants.AddressZero) {
        noty('Error: KNOT is not a part of Stakehouse')
        return
      }
    } else {
      stakehouseAddress = selectedValidator.stakeHouseMetadata.id
    }

    try {
      setWithdrawing(true)
      const tx = await sdk.addKnotToOpenIndexAndWithdraw(
        stakehouseAddress,
        blsPublicKey,
        userAddress
      )
      notifyHash(tx.hash)
      await tx.wait()
      navigate('/')
    } catch (err: any) {
      console.log('withdraw err: ', err)
      noty(err.message || err)
    }
    setWithdrawing(false)
  }

  const nameOverlapped = useMemo(() => {
    if (reversedNameArr.findIndex((name) => name.toLowerCase() === tickerName.toLowerCase()) > -1) {
      return true
    }

    return false
  }, [tickerName])

  if (minted) {
    return (
      <div className={styles.body}>
        <div className={styles.bodyContainer}>
          <ETHBigIcon />
          <p className={styles.bodyTitle}>Success</p>
          <p className={styles.bodyDesc}>You have minted your derivatives!</p>
          <div className={styles.FormControl}>
            <Button onClick={handleWithdrawDEth} disabled={isWithdrawing}>
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw dETH'}
            </Button>
            <Link to="/" className="ml-3">
              <Button variant="secondary">My Profile</Button>
            </Link>
          </div>
          <a
            href={makeEtherscanLink(mintTxHash)}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-sm flex items-center gap-3">
            Etherscan <TopRightGreenIcon />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.body}>
      <div className={styles.bodyContainer}>
        <ETHBigIcon />
        <p className={styles.bodyTitle}>Create a Stakehouse</p>
        <div className={styles.bodyCardContainer}>
          <div className={styles.bodyCard}>
            <p className={styles.bodyCardTitle}>Mint</p>
            <p className={styles.bodyCardDetails}>24 dETH</p>
            <div className={styles.bodyCardTooltipWrap}>
              <Tooltip message="Derivative staked ETH." />
            </div>
          </div>
          <div className={styles.bodyCard}>
            <p className={styles.bodyCardTitle}>Mint</p>
            <p className={styles.bodyCardDetails}>8 SLOTS</p>
            <div className={styles.bodyCardTooltipWrap}>
              <Tooltip message="SLOT tokens are your liquid validator tokens." />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-grey100">Ticker*</p>
            <Tooltip message="Select a name for your Stakehouse." />
          </div>
          <div className="relative w-full mb-3">
            <input
              type="text"
              className={styles.tickerNameInput}
              value={tickerName}
              onChange={(e) => setTickerName(e.target.value)}
            />
            <div className={styles.tickerNameInputPrefix}>s</div>
            {tickerName.length > 0 &&
              (tickerName.length < 3 ||
                tickerName.length > 5 ||
                !tickerName.match(/^[a-zA-Z]+$/)) && (
                <span className={styles.errorTxt}>
                  Ticker length should be from 3 to 5 characters.
                </span>
              )}
          </div>
        </div>
        <div className={styles.bodyFormControl}>
          <div className="flex gap-1 items-center">
            <p className={styles.bodyFormLabel}>Report Balance</p>
            <Tooltip message="Reporting your validator's balance ensures you have 32+ ETH in your validator." />
          </div>
          {isSubmitting ? (
            <Spinner size={34} />
          ) : (
            <Button disabled={submitted || nameOverlapped} className="w-36" onClick={handleSubmit}>
              {submitted ? 'Done' : 'Submit'}
            </Button>
          )}
        </div>
        <div className={styles.bodyFormControl}>
          <div className="flex gap-1 items-center">
            <p className={styles.bodyFormLabel}>Mint Tokens</p>
            <Tooltip message="By minting dETH and SLOT tokens, you will create a Stakehouse." />
          </div>
          <Button disabled={!submitted} className="w-36" onClick={handleMint}>
            Mint
          </Button>
        </div>
      </div>
      <ModalConfirmMint
        open={showMintModal}
        onClose={() => setShowMintModal(false)}
        blsPublicKey={blsPublicKey}
        from="CREATE"
        onMint={handleGoNextStep}
        selectedTicker={tickerName}
        signature={signature}
      />
      <ModalNameInvalid open={nameOverlapped} onClose={() => setTickerName('')} />
    </div>
  )
}

export default CreateStakehouseContent
