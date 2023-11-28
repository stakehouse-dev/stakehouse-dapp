import { FC, useState, useEffect, useMemo } from 'react'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { BigNumber, ethers } from 'ethers'
import { Helmet } from 'react-helmet'

import { ContainerLayout } from 'components/layouts'
import { ActionableSection, DefaultModalView, ErrorModal, ModalDialog } from 'components/shared'
import { StatCard } from 'components/app/RageQuit'
import { ModalRageQuitConfirmation } from 'components/app/Modals'

import { useSDK, useCurrentValidator, useUser, useNetworkBasedLinkFactories } from 'hooks'
import {
  getBalanceReport,
  getExitFee,
  performRageQuit,
  checkNonZeroDETHBalance
} from 'lib/ragequit'
import { BalanceReportT } from 'types'
import {
  weiToEthNum,
  cutDecimals,
  noty,
  notifyHash,
  isTxRejectedByUser,
  convertDateToString
} from 'utils/global'

import styles from './styles.module.scss'
import { ModalWithdrawSuccessful } from 'components/app/Modals/ModalWithdrawSuccessful'
import { getRageQuitAssistant } from 'views/ExitStatus'
import { useBalance } from 'wagmi'
import { config } from 'constants/environment'
import { BEACON_NODE_URL } from 'constants/chains'
import { formatEther, parseEther } from 'ethers/lib/utils.js'
import { useQuery } from '@apollo/client'
import { sETHTokenAddressQuery } from 'graphql/queries/knot'

const MultiPartyRageQuitPage: FC = () => {
  const { validator, isValidatorDataLoading } = useCurrentValidator()

  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { userAddress } = useUser()

  const [exitFee, setExitFee] = useState<number | null>(null)

  const [borrowDETHError, setBorrowDETHError] = useState(false)
  const [isDETHLoading, setIsDETHLoading] = useState(false)

  const [borrowSETHError, setBorrowSETHError] = useState(false)
  const [isSETHLoading, setIsSETHLoading] = useState(false)

  const [step1Confirmed, setStep1Confirmed] = useState<boolean>(false)
  const [step2Confirmed, setStep2Confirmed] = useState<boolean>(false)

  const [isBalanceReportLoading, setIsBalanceReportLoading] = useState(false)
  const [isBalanceReportError, setIsBalanceReportError] = useState(false)

  const [rageQuitAssistantAddress, setRageQuitAssistantAddress] = useState<string>('')
  const [balanceReport, setBalanceReport] = useState<BalanceReportT | null>(null)

  const [rageQuitResult, setRageQuitResult] = useState<any>(null)
  const [isRageQuitConfirmationModalOpen, setIsRageQuitConfirmationModalOpen] = useState(false)
  const [isRageQuitSuccessModalOpen, setIsRageQuitSuccessModalOpen] = useState(false)
  const [isRageQuitConfirmLoading, setIsRageQuitConfirmLoading] = useState(false)
  const [rageQuitConfirmError, setRageQuitConfirmError] = useState('')

  const isPageLoading = isValidatorDataLoading

  const rageQuitResultTxLink = (() => {
    if (!rageQuitResult) return ''
    return makeEtherscanLink(rageQuitResult.hash)
  })()

  const dETHBurnAmount = (() => {
    if (!validator) return null
    return cutDecimals(weiToEthNum(BigNumber.from(validator.totalDETHMinted)), 1)
  })()
  const slotsBurnAmount = (() => {
    if (!validator) return null
    return cutDecimals(weiToEthNum(BigNumber.from(validator?.totalSLOT)), 1)
  })()
  const ethSupply = (() => {
    if (!exitFee) return null
    return cutDecimals(weiToEthNum(BigNumber.from(exitFee)), 1)
  })()

  useEffect(() => {
    const fetchAssistant = async () => {
      const rageQuitAssistantAddress = await getRageQuitAssistant(validator?.id)

      setRageQuitAssistantAddress(rageQuitAssistantAddress)
    }
    if (validator) fetchAssistant()
  }, [validator])

  const { data: { stakeHouse } = {} } = useQuery(sETHTokenAddressQuery, {
    variables: { stakehouseAddress: (validator?.stakeHouseMetadata ?? {}).id },
    skip: !validator
  })

  const { data: { value: dETHBalance } = {} } = useBalance({
    address: userAddress as `0x${string}` | undefined,
    formatUnits: 'ether',
    token: config.dethTokenAddress as `0x${string}`
  })

  const { data: { value: assistantDETHBalance } = {} } = useBalance({
    address: rageQuitAssistantAddress as `0x${string}` | undefined,
    formatUnits: 'ether',
    enabled: rageQuitAssistantAddress.length > 0,
    token: config.dethTokenAddress as `0x${string}`
  })

  async function reportBalance(isCallFromStep = false) {
    if (!validator || !sdk) return

    setIsBalanceReportLoading(true)

    let report: BalanceReportT | null = null

    try {
      const response = await getBalanceReport(sdk, validator.id)
      if (!response || response === 'error') throw new Error()
      report = response
    } catch (err) {
      setIsBalanceReportError(true)
    }

    if (report) {
      try {
        const { withdrawalEpoch, currentCheckpointEpoch } = report.report

        let exitFeeResponse
        if (Number(currentCheckpointEpoch) < Number(withdrawalEpoch)) {
          exitFeeResponse = await getExitFee(sdk, report)
          if (!exitFeeResponse) throw new Error()
        } else {
          exitFeeResponse = await sdk.utils.calculateExitFee(validator.id)
          if (!exitFeeResponse) throw new Error()
        }

        setExitFee(exitFeeResponse)
        if (isCallFromStep) setBalanceReport(report)
        setIsBalanceReportError(false)
      } catch (err) {
        console.error(err)
        setIsBalanceReportError(true)
        noty('Failed to fetch exit fee')
      }
    }

    setIsBalanceReportLoading(false)
  }

  useEffect(() => {
    const checkIfStep1Confirmed = async () => {
      setIsSETHLoading(true)
      const contract = (await sdk?.contractInstance).stakehouseRageQuitAssistant(
        rageQuitAssistantAddress
      )
      const contractBalance = await contract.totalSETHDeposited()

      if (contractBalance.eq(parseEther('12'))) setStep1Confirmed(true)
      setIsSETHLoading(false)
    }

    if (sdk && rageQuitAssistantAddress.length > 0) checkIfStep1Confirmed()
  }, [sdk, rageQuitAssistantAddress])

  useEffect(() => {
    const checkIfStep2Confirmed = async () => {
      setIsDETHLoading(true)
      const requiredDETH = await sdk?.multipartyRageQuit.getDETHRequiredForIsolation(
        rageQuitAssistantAddress
      )

      const depositAmount = requiredDETH.sub(assistantDETHBalance)

      if (depositAmount.lte(ethers.BigNumber.from('0'))) setStep2Confirmed(true)
      setIsDETHLoading(false)
    }

    if (sdk && step1Confirmed && rageQuitAssistantAddress.length > 0) checkIfStep2Confirmed()
  }, [sdk, assistantDETHBalance, step1Confirmed, rageQuitAssistantAddress])

  useEffect(() => {
    if (sdk && validator) reportBalance()
  }, [sdk, validator])

  const handleBorrowSETH = async () => {
    try {
      setIsSETHLoading(true)

      const userAmount = await sdk?.utils.getsETHBalance(
        validator?.stakeHouseMetadata?.id,
        userAddress
      )

      const amount = Number(formatEther(userAmount)) > 12 ? parseEther('12') : userAmount

      const contract = (await sdk?.contractInstance).stakehouseRageQuitAssistant(
        rageQuitAssistantAddress
      )
      const contractBalance = await contract.totalSETHDeposited()

      const depositAmount = amount.sub(contractBalance)

      const sETHContract = (await sdk?.contractInstance).genericERC20Contract(stakeHouse.sETH)
      const approveTx = await sETHContract.approve(rageQuitAssistantAddress, depositAmount)

      notifyHash(approveTx.hash)
      await approveTx.wait()

      const tx = await sdk?.multipartyRageQuit.depositSETHInRageQuitAssistant(
        rageQuitAssistantAddress,
        depositAmount
      )

      notifyHash(tx.hash)
      await tx.wait()

      setStep1Confirmed(true)
    } catch (err) {
      console.log(err)
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: Borrow SETH failed'
        setBorrowSETHError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsSETHLoading(false)
    }
  }
  const handleBorrowDETH = async () => {
    try {
      setIsDETHLoading(true)

      const requiredDETH = await sdk?.multipartyRageQuit.getDETHRequiredForIsolation(
        rageQuitAssistantAddress
      )

      const depositAmount = requiredDETH.sub(assistantDETHBalance)

      const dETHContract = (await sdk?.contractInstance).dETHContract()
      const approveDETHTx = await dETHContract.approve(rageQuitAssistantAddress, depositAmount)

      notifyHash(approveDETHTx.hash)
      await approveDETHTx.wait()

      const tx = await sdk?.multipartyRageQuit.depositDETHInRageQuitAssistant(
        rageQuitAssistantAddress,
        depositAmount
      )

      notifyHash(tx.hash)
      await tx.wait()

      setStep2Confirmed(true)
    } catch (err) {
      console.log(err)
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: Borrow DETH failed'
        setBorrowDETHError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsDETHLoading(false)
    }
  }

  async function removeKNOT() {
    if (!validator?.stakeHouseMetadata || !sdk) return

    setIsRageQuitConfirmationModalOpen(true)

    try {
      setIsRageQuitConfirmLoading(true)

      const response = await sdk.multipartyRageQuit.multipartyRageQuit(
        validator.stakeHouseMetadata.id,
        rageQuitAssistantAddress,
        null,
        balanceReport,
        null,
        exitFee,
        false
      )

      if (response === 'rejected') throw new Error('Transaction was rejected.')
      if (response === 'error') throw new Error('Error performing Rage Quit. Please try again.')

      setRageQuitConfirmError('')
      setIsRageQuitConfirmationModalOpen(false)
      setIsRageQuitSuccessModalOpen(true)
      setRageQuitResult(response)
    } catch (err) {
      const errorMessage = (err as any)?.message || 'Error performing Rage Quit. Please try again.'
      setRageQuitConfirmError(errorMessage)
      noty(errorMessage)
    } finally {
      setIsRageQuitConfirmLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Validator Rage Quit - Stakehouse</title>
      </Helmet>
      <ContainerLayout title="Rage Quit" loading={isPageLoading} back>
        <div className={styles.wrapper}>
          <div className={styles.title}>Rage Quit</div>
          <div className={styles.stats}>
            <StatCard
              label="Burn"
              empty={!dETHBurnAmount}
              tooltip="You must burn all dETH and savETH associated with your validator.">
              {dETHBurnAmount} dETH
            </StatCard>
            <StatCard
              label="Burn"
              empty={!slotsBurnAmount}
              tooltip="You must burn all 8 SLOT tokens assocciated with your validator.">
              {slotsBurnAmount} SLOTS
            </StatCard>
            <StatCard
              label="Supply"
              empty={!ethSupply}
              tooltip="If you are not holding enough sETH to cover your redemption rate, you will be required to supply ETH.">
              {ethSupply} ETH
            </StatCard>
          </div>

          <div className={styles.steps}>
            <div>
              <ActionableSection
                label="Borrow sETH"
                tooltip=" "
                loading={isSETHLoading}
                done={step1Confirmed}
                actionable
                actionContent={borrowSETHError ? 'Retry' : 'Confirm'}
                onAction={handleBorrowSETH}
              />

              {borrowSETHError && (
                <div className="text-xs text-error pl-2 mt-1">
                  Error while borrowing sETH. Please try again.
                </div>
              )}
            </div>

            <div>
              <ActionableSection
                label="Borrow dETH"
                tooltip=" "
                disabled={!step1Confirmed}
                loading={isDETHLoading}
                done={step2Confirmed}
                actionable
                actionContent={borrowDETHError ? 'Retry' : 'Confirm'}
                onAction={handleBorrowDETH}
              />

              {borrowDETHError && (
                <div className="text-xs text-error pl-2 mt-1">
                  Error while borrowing dETH. Please try again.
                </div>
              )}
            </div>

            <div>
              <ActionableSection
                label="Report Balance"
                tooltip="Verify that conditions are met to remove your validator from the Stakehouse registry."
                disabled={!step2Confirmed}
                loading={isBalanceReportLoading}
                done={!!balanceReport}
                actionable
                actionContent={isBalanceReportError ? 'Retry' : 'Submit'}
                onAction={() => reportBalance(true)}
              />

              {isBalanceReportError && (
                <div className="text-xs text-error pl-2 mt-1">
                  Error while fetching your balance. Please try again.
                </div>
              )}
            </div>

            <ActionableSection
              label="Withdraw Validator"
              tooltip="Removing a KNOT is removing your validator from the Stakehouse registry. This cannot be undone!"
              disabled={!balanceReport}
              loading={isRageQuitConfirmLoading}
              done={!!rageQuitResult}
              actionable
              actionContent={rageQuitConfirmError ? 'Retry' : 'Submit'}
              onAction={removeKNOT}
            />

            <ModalRageQuitConfirmation
              open={isRageQuitConfirmationModalOpen}
              onClose={() => setIsRageQuitConfirmationModalOpen(false)}
              txLink={rageQuitResultTxLink}
              loading={isRageQuitConfirmLoading}
              errorMessage={rageQuitConfirmError}
              onErrorAction={removeKNOT}
            />
            <ModalWithdrawSuccessful
              open={isRageQuitSuccessModalOpen}
              blsKey={validator?.id || ''}
              onClose={() => setIsRageQuitSuccessModalOpen(false)}
              txLink={rageQuitResultTxLink}
            />
          </div>
        </div>
      </ContainerLayout>
    </>
  )
}

export default MultiPartyRageQuitPage
