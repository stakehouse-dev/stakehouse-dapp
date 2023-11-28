import { FC, useState } from 'react'
import {
  DefaultModalView,
  LoadingModalView,
  Button,
  CompletedTxView,
  ErrorModalView
} from 'components/shared'

import { notifyHash, noty, isTxRejectedByUser } from 'utils/global'

import { useUser, useSDK, useNetworkBasedLinkFactories } from 'hooks'

import { BEACON_NODE_URL } from 'constants/chains'
import { ModalDialogWithoutMinHeight } from 'components/shared/Modal/ModalDialogWithoutMinHeight'
import { BalanceReportT } from 'types'
import { ethers } from 'ethers'
import { getRageQuitAssistant } from 'views/ExitStatus'

export interface IProps {
  open: boolean
  onClose: () => void
  withdrawValidatorId?: string
  fromIndex?: boolean
  indexedOnly?: boolean
}

export const ModalWithdrawETHFromUnstakedValidator: FC<IProps> = ({
  open,
  onClose,
  withdrawValidatorId = ''
}) => {
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { isValidatorsDataLoading, validators } = useUser()
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<{ hash: string } | null>(null)
  const [withdrawalError, setWithdrawalError] = useState('')
  const [isMultiPartyRageQuit, setIsMultiPartyRageQuit] = useState<boolean>(false)
  const [rageQuitAssistantAddress, setRageQuitAssistantAddress] = useState<string>()
  const [txResults, setTxResults] = useState<any>()
  const { userAddress } = useUser()

  const validatorInfo = validators.find(({ id }) => id === withdrawValidatorId)

  const txNames = [
    'Node operator Withdrawal',
    'dETH Withdrawal',
    'sETH Withdrawal',
    'Collateralised SLOT Withdrawal'
  ]

  const withdrawTxLink = (() => {
    if (!withdrawResult) return ''
    return makeEtherscanLink(withdrawResult.hash)
  })()

  async function handleWithdrawETH() {
    if (!sdk) return

    try {
      setIsWithdrawLoading(true)

      let authenticatedReport: BalanceReportT
      try {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          withdrawValidatorId
        )
        authenticatedReport = await sdk.balanceReport.authenticateReport(
          BEACON_NODE_URL,
          finalisedEpochReport
        )
      } catch (err) {
        console.log('handleWithdrawValidator error: ', err)

        return
      }

      const { withdrawalEpoch, currentCheckpointEpoch, activeBalance } = authenticatedReport.report

      if (Number(withdrawalEpoch) - currentCheckpointEpoch > 0) {
        setIsWithdrawLoading(false)
        throw 'Withdrawal in Progress'
      }

      if (Number(activeBalance) !== 0) {
        setIsWithdrawLoading(false)
        throw 'Withdrawal to Stakehouse Protocol not yet complete by Consensus Layer. Please try again later'
      }

      let finalisedReport
      try {
        finalisedReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          withdrawValidatorId
        )
      } catch (err) {
        console.log('getFinalisedEpochReport error: ', err)
        throw err
      }
      const validatorIndex = finalisedReport.validatorIndex

      let totalETHSentToBLSPublicKey
      try {
        totalETHSentToBLSPublicKey = await sdk.balanceReport.getTotalETHSentToBlsKey(
          withdrawValidatorId
        )
        totalETHSentToBLSPublicKey = totalETHSentToBLSPublicKey.toString()
      } catch (err) {
        console.log('getTotalETHSentToBlsKey error: ', err)
        throw err
      }

      let slotIndexes
      try {
        slotIndexes = await sdk.balanceReport.getStartAndEndSlotByValidatorIndex(validatorIndex)
      } catch (err) {
        console.log('getStartAndEndSlotByValidatorIndex error: ', err)
        throw err
      }

      let sweeps
      try {
        sweeps = await sdk.balanceReport.getDETHSweeps(
          validatorIndex,
          slotIndexes[1],
          slotIndexes[0]
        )
      } catch (err) {
        console.log('getDETHSweeps error: ', err)
        throw err
      }

      if (sweeps) {
        let finalSweep: any
        try {
          finalSweep = await sdk.balanceReport.getFinalSweep(BEACON_NODE_URL, validatorIndex)
        } catch (err) {
          console.log('getFinalSweep error: ', err)
          throw err
        }

        const filteredInsideSweeps = sweeps.sweeps.filter(
          (sweep: any) =>
            sweep.withdrawal_index &&
            Number(sweep.withdrawal_index) !== Number(finalSweep.sweep.index)
        )
        sweeps = { sweeps: filteredInsideSweeps }

        let unreportedSweeps = await sdk.withdrawal.filterUnreportedSweepReports(sweeps.sweeps)
        sweeps = { sweeps: unreportedSweeps }

        const sumOfSweeps = sdk.balanceReport.calculateSumOfSweeps(sweeps.sweeps)

        let listOfUnverifiedReports: any[] = []
        try {
          const stakeHouse = validatorInfo?.stakeHouseMetadata?.id
          if (!sumOfSweeps.eq(ethers.BigNumber.from('0'))) {
            const verifyAndReport = await sdk.withdrawal.verifyAndReportAllSweepsAtOnce(
              stakeHouse,
              totalETHSentToBLSPublicKey.toString(),
              sweeps.sweeps,
              finalisedReport,
              true
            )

            notifyHash(verifyAndReport.tx.hash)
            await verifyAndReport.tx.wait(3)

            listOfUnverifiedReports = verifyAndReport.listOfUnverifiedReports
          }
        } catch (err) {
          console.log('verifyAndReportAllSweepsAtOnce err: ', err)
          throw err
        }

        const sumOfUnVerifiedReports =
          sdk.balanceReport.calculateSumOfSweeps(listOfUnverifiedReports)

        let finalReport
        try {
          finalReport = await sdk.balanceReport.generateFinalReport(
            BEACON_NODE_URL,
            withdrawValidatorId,
            totalETHSentToBLSPublicKey,
            sumOfUnVerifiedReports,
            listOfUnverifiedReports,
            finalSweep
          )
          finalReport.blsPublicKey = sdk.utils.remove0x(finalReport.blsPublicKey)
          finalReport.totalETHSentToBLSKey = totalETHSentToBLSPublicKey.toString()
          finalReport.sumOfUnreportedSweeps = sumOfUnVerifiedReports.toString()
        } catch (err) {
          console.log('generateFinalReport and formatSweepReport error: ', err)
          throw err
        }

        let verifyFinalReport
        try {
          verifyFinalReport = await sdk.balanceReport.verifyFinalReport(
            finalReport.unreportedSweeps.sweeps,
            finalReport
          )
        } catch (err) {
          console.log('verifyFinalReport error: ', err)
          throw err
        }

        const rageQuitAssistantAddress = await getRageQuitAssistant(withdrawValidatorId)

        let tx
        if (rageQuitAssistantAddress) {
          tx = await sdk.multipartyRageQuit.executeFullWithdrawal(
            rageQuitAssistantAddress,
            totalETHSentToBLSPublicKey,
            finalReport.unreportedSweeps,
            verifyFinalReport
          )

          setIsMultiPartyRageQuit(true)
        } else {
          tx = await sdk.withdrawal.reportFinalSweepAndWithdraw(
            totalETHSentToBLSPublicKey,
            finalReport.unreportedSweeps,
            verifyFinalReport
          )

          setIsMultiPartyRageQuit(false)
        }
        setRageQuitAssistantAddress(rageQuitAssistantAddress)

        notifyHash(tx.hash)
        await tx.wait(1)

        setWithdrawalError('')
        setWithdrawResult(tx)
      } else {
        throw 'sweeps is null.'
      }
    } catch (err) {
      console.error(err)
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: ETH withdrawal failed'
        setWithdrawalError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsWithdrawLoading(false)
    }
  }

  function handleClose() {
    setWithdrawResult(null)
    setWithdrawalError('')
    onClose()
  }

  const handleClaim = async () => {
    setIsWithdrawLoading(true)
    const res = await sdk?.multipartyRageQuit.getClaimUnstakedETH(
      rageQuitAssistantAddress,
      userAddress
    )
    const { dETH, sETH } = res

    const transactions = await Promise.all([
      sdk?.multipartyRageQuit.nodeOperatorClaimFromRageQuitAssistant(rageQuitAssistantAddress),
      sdk?.multipartyRageQuit.claimDETHFromRageQuitAssistant(rageQuitAssistantAddress, dETH),
      sdk?.multipartyRageQuit.claimSETHFromRageQuitAssistant(rageQuitAssistantAddress, sETH),
      sdk?.multipartyRageQuit.claimForCollateralisedSlotOwner(
        rageQuitAssistantAddress,
        withdrawValidatorId,
        userAddress,
        undefined
      )
    ])

    transactions.map((tx) => notifyHash(tx.hash))

    const txResults = await Promise.all(transactions.map((tx) => tx.wait()))

    console.log('txResults', txResults)
    setWithdrawResult(null)
    setTxResults(txResults)
    setIsWithdrawLoading(false)
  }

  return (
    <>
      <ModalDialogWithoutMinHeight open={open} onClose={handleClose}>
        {isWithdrawLoading ? (
          <LoadingModalView title="Confirmation Pending" />
        ) : withdrawalError ? (
          <ErrorModalView
            title="Failed to withdraw ETH"
            message={withdrawalError}
            actionButtonContent="Retry"
            onAction={handleWithdrawETH}
          />
        ) : withdrawResult ? (
          <CompletedTxView
            title={
              isMultiPartyRageQuit ? `You've unstaked the Validator` : `You've withdrawn your ETH`
            }
            message="Your transaction has processed."
            txLink={withdrawTxLink}
            onGoToClick={isMultiPartyRageQuit ? handleClaim : handleClose}
            goToContent={isMultiPartyRageQuit ? `Claim` : `Home`}
          />
        ) : txResults ? (
          <CompletedTxView
            goToContent="Home"
            title="Success"
            txLinks={
              txResults &&
              txResults?.map((tx: any, index: number) => {
                return {
                  name: txNames[index],
                  href: makeEtherscanLink(tx.hash)
                }
              })
            }
            onGoToClick={handleClose}
            message={
              <div className="flex flex-col items-center">
                <span className="text-sm text-grey300">{`Your transactions has been processed.`}</span>
              </div>
            }
          />
        ) : (
          <DefaultModalView
            title="Withdraw ETH from unstaked validator"
            loading={isValidatorsDataLoading}
            className="w-full">
            <Button size="lg" className="w-full" onClick={handleWithdrawETH}>
              Confirm
            </Button>
          </DefaultModalView>
        )}
      </ModalDialogWithoutMinHeight>
    </>
  )
}
