import { FC, useState, useEffect } from 'react'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { BigNumber } from 'ethers'
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
import client from 'graphql/client'
import { IndexOwnerQuery } from 'graphql/queries/knot'
import { useQuery } from '@apollo/client'
import { BEACON_NODE_URL } from 'constants/chains'

const RageQuitPage: FC = () => {
  const [knotData, setKnotData] = useState<any[]>([])
  const [isKnotDataLoading, setKnotDataLoading] = useState(false)

  const { validator, isValidatorDataLoading } = useCurrentValidator()
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { userAddress } = useUser()

  useEffect(() => {
    const fetchKnotData = async () => {
      if (sdk && userAddress) {
        setKnotDataLoading(true)
        const knotData = await sdk.wizard.getCumulativeValidatorIndexes(
          userAddress.toLowerCase() || ''
        )
        setKnotData(knotData)
        setKnotDataLoading(false)
      }
    }
    fetchKnotData()
  }, [sdk, userAddress])

  const [exitFee, setExitFee] = useState<number | null>(null)

  const [isDETHCheckLoading, setIsDETHCheckLoading] = useState(true)
  const [canIsolateDETH, setCanIsolateDETH] = useState(false)
  const [isolateDETHLoading, setIsolateDETHLoading] = useState(false)
  const [isDETHIsolationConfirmed, setIsDETHIsolationConfirmed] = useState(false)
  const [dETHIsolationError, setDETHIsolationError] = useState('')

  const [balanceReport, setBalanceReport] = useState<BalanceReportT | null>(null)
  const [isBalanceReportLoading, setIsBalanceReportLoading] = useState(false)
  const [isBalanceReportError, setIsBalanceReportError] = useState(false)

  const [rageQuitResult, setRageQuitResult] = useState<TransactionReceipt | null>(null)
  const [isRageQuitConfirmationModalOpen, setIsRageQuitConfirmationModalOpen] = useState(false)
  const [isRageQuitSuccessModalOpen, setIsRageQuitSuccessModalOpen] = useState(false)
  const [isRageQuitConfirmLoading, setIsRageQuitConfirmLoading] = useState(false)
  const [rageQuitConfirmError, setRageQuitConfirmError] = useState('')

  const isPageLoading = isValidatorDataLoading || isDETHCheckLoading || isKnotDataLoading

  const isDETHIsolationStepSuccess =
    (isDETHIsolationConfirmed || !canIsolateDETH) && !isolateDETHLoading && !isDETHCheckLoading

  const rageQuitResultTxLink = (() => {
    if (!rageQuitResult) return ''
    return makeEtherscanLink(rageQuitResult.transactionHash)
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
    if (validator) {
      loadDETHBalanceCheck()
    }
  }, [validator])

  async function loadDETHBalanceCheck() {
    if (!sdk || !validator) return

    try {
      setIsDETHCheckLoading(true)
      const result = await checkNonZeroDETHBalance(sdk, validator.id)
      if (result && weiToEthNum(BigNumber.from(result)) === 0) {
        setCanIsolateDETH(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsDETHCheckLoading(false)
    }
  }

  const { data: { savETHIndexes } = {} } = useQuery(IndexOwnerQuery, {
    variables: {
      account: userAddress
    },
    skip: !userAddress
  })

  const getIndexOwnedByTheUser = async () => {
    const { data: { savETHIndexes } = {} } = await client.query({
      query: IndexOwnerQuery,
      variables: {
        account: userAddress
      }
    })

    return savETHIndexes
  }

  async function confirmDETHIsolation() {
    if (!sdk || !validator || knotData.length === 0) return

    try {
      let indexId = undefined
      if (!savETHIndexes.length) {
        const tx = await sdk.createIndex(userAddress)

        notifyHash(tx.hash)
        await tx.wait(2)

        const indexes = await getIndexOwnedByTheUser()

        indexId = indexes[0].id
      } else {
        indexId = savETHIndexes[0].id
      }

      if (!indexId) {
        setDETHIsolationError("You don't own an index yet. Please try again.")
        noty("You don't own an index yet. Please try again.")
        return
      }
      setIsolateDETHLoading(true)
      const tx = await sdk.depositAndIsolateKnotIntoIndex(
        validator.stakeHouseMetadata!.id,
        validator.id,
        indexId
      )
      notifyHash(tx.hash)
      await tx.wait()

      setDETHIsolationError('')
      setIsDETHIsolationConfirmed(true)
    } catch (err) {
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: dETH isolation failed'
        setDETHIsolationError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsolateDETHLoading(false)
    }
  }

  async function reportBalance() {
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
        const exitFeeResponse = await getExitFee(sdk, report)
        if (!exitFeeResponse) throw new Error()

        setExitFee(exitFeeResponse)
        setBalanceReport(report)
        setIsBalanceReportError(false)
      } catch (err) {
        setIsBalanceReportError(true)
        noty('Failed to fetch exit fee')
      }
    }

    setIsBalanceReportLoading(false)
  }

  async function removeKNOT() {
    if (!validator?.stakeHouseMetadata || !balanceReport || !sdk || exitFee === null) return

    setIsRageQuitConfirmationModalOpen(true)

    try {
      setIsRageQuitConfirmLoading(true)

      const response = await performRageQuit(
        sdk,
        validator.stakeHouseMetadata.id,
        balanceReport,
        userAddress,
        exitFee
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
                label="Isolate and burn dETH"
                tooltip="This will isolate and burn the dETH associated  with the savETH in your validator."
                loading={isolateDETHLoading || isDETHCheckLoading}
                done={isDETHIsolationStepSuccess}
                actionable
                actionContent={dETHIsolationError ? 'Retry' : 'Confirm'}
                onAction={confirmDETHIsolation}
              />

              {dETHIsolationError && (
                <div className="text-xs text-error pl-2 mt-1">
                  Error: dETH isolation failed. Please try again.
                </div>
              )}
            </div>

            <div>
              <ActionableSection
                label="Report Balance"
                tooltip="Verify that conditions are met to remove your validator from the Stakehouse registry."
                disabled={!isDETHIsolationStepSuccess}
                loading={isBalanceReportLoading}
                done={!!balanceReport}
                actionable
                actionContent={isBalanceReportError ? 'Retry' : 'Submit'}
                onAction={reportBalance}
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

export default RageQuitPage
