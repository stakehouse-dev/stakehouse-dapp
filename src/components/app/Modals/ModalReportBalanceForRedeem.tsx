import { useQuery } from '@apollo/client'
import { Dialog } from '@headlessui/react'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import { ReactComponent as RedAlertIcon } from 'assets/images/icon-alert-red.svg'
import { Modal, Spinner } from 'components/shared'
import { BEACON_NODE_URL } from 'constants/chains'
import { getStakehouseAccounts } from 'graphql/queries/validators'
import { useSDK } from 'hooks'
import { EligibleValidator, TStakehouseSDK } from 'types'
import { notifyHash } from 'utils/global'

import styles from './styles.module.scss'

interface ModalReportBalanceForRedeemProps {
  open: boolean
  validators: any[]
  dETHAmount: string
  onClose: () => void
  onSubmitted: () => void
}

const fetchUnformattedSweepData = async (sdk: TStakehouseSDK, validatorIndex: string) => {
  let [endSlot, startSlot] = await sdk.balanceReport.getStartAndEndSlotByValidatorIndex(
    validatorIndex
  )
  const unformattedSweepReport = (
    await sdk.balanceReport.getDETHSweeps(validatorIndex, startSlot, endSlot)
  ).sweeps

  return unformattedSweepReport
}

export const ModalReportBalanceForRedeem = ({
  open,
  validators,
  dETHAmount,
  onClose,
  onSubmitted
}: ModalReportBalanceForRedeemProps) => {
  const { sdk } = useSDK()
  // const { isGnosis } = useUser()

  const [initialLoading, setInitialLoading] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState('')
  const [selectedBlsKeys, setSelectedBlsKeys] = useState<string[]>([])
  const [finalisedReportsForPartialWithdrawal, setFinalisedReportsForPartialWithdrawal] =
    useState<any>()
  const [totalETHSentToEachBLSKey, setTotalETHSentToEachBLSKey] = useState<BigNumber[]>([])
  const [unformattedSweepReports, setUnformattedSweepReports] = useState<any[]>([])
  const [verifyResult, setVerifyResult] = useState<any>()

  const { data: { stakehouseAccounts } = {} } = useQuery(getStakehouseAccounts, {
    variables: { blsPublicKeys: selectedBlsKeys },
    skip: selectedBlsKeys.length === 0
  })

  useEffect(() => {
    const fetchData = async () => {
      if (stakehouseAccounts && stakehouseAccounts.length > 0 && sdk) {
        setInitialLoading(true)

        const selectedAccountIds: string[] = stakehouseAccounts.map((sAccount: any) => sAccount.id)

        const promises = selectedAccountIds.map((blsKey) =>
          sdk.balanceReport.getTotalETHSentToBlsKey(blsKey)
        )

        const finalisedReportsForPartialWithdrawal: any[] =
          await sdk.balanceReport.getFinalisedEpochReportForMultipleBLSKeys(
            BEACON_NODE_URL,
            selectedAccountIds
          )
        setFinalisedReportsForPartialWithdrawal(finalisedReportsForPartialWithdrawal)

        await Promise.allSettled(promises)
          .then(async (results) => {
            setTotalETHSentToEachBLSKey(results.map((result: any) => result.value))
          })
          .catch((err) => {
            console.log('getTotalETHSentToBlsKeys error: ', err)
          })

        await Promise.allSettled(
          finalisedReportsForPartialWithdrawal.map((validator) =>
            fetchUnformattedSweepData(sdk, validator.validatorIndex)
          )
        )
          .then((results) => {
            setUnformattedSweepReports(results.map((result: any) => result.value))
          })
          .catch((err) => {
            console.log('fetchUnformattedSweepData error: ', err)
          })

        setInitialLoading(false)
      }
    }

    fetchData()
  }, [stakehouseAccounts, sdk])

  useEffect(() => {
    const fetchData = async () => {
      if (sdk && validators && validators.length > 0) {
        const selectedBlsKeys = validators.map((validator) =>
          sdk.utils.add0x(validator.blsPublicKey)
        )
        setSelectedBlsKeys(selectedBlsKeys)
      }
    }

    fetchData()
  }, [validators, sdk])

  const handleReportBalance = useCallback(async () => {
    if (
      sdk &&
      stakehouseAccounts &&
      totalETHSentToEachBLSKey?.length > 0 &&
      unformattedSweepReports?.length > 0 &&
      finalisedReportsForPartialWithdrawal?.length > 0
    ) {
      setSubmitting(true)
      setInitialLoading(true)
      try {
        const results = await sdk.withdrawal.verifyAndReportSweepsForMultipleBLSKeys(
          stakehouseAccounts.map((sAccount: any) => sAccount.stakeHouse),
          totalETHSentToEachBLSKey,
          unformattedSweepReports,
          finalisedReportsForPartialWithdrawal,
          validators.length
        )
        if (results) {
          setVerifyResult(results)
          const { tx } = results
          // if (!isGnosis) {
          notifyHash(tx.hash)
          // }
          await tx.wait()
        }
      } catch (err) {
        console.log('report balance for redeem error: ', err)
      }
    }

    setSubmitting(false)
    handleClose(true)
  }, [
    sdk,
    validators,
    stakehouseAccounts,
    totalETHSentToEachBLSKey,
    unformattedSweepReports,
    finalisedReportsForPartialWithdrawal,
    dETHAmount
  ])

  useEffect(() => {
    if (open && !initialLoading) {
      handleReportBalance()
    }
  }, [handleReportBalance, open, initialLoading])

  const handleClose = (suceed?: boolean) => {
    setFailed('')
    setVerifyResult(undefined)
    setSubmitting(false)
    if (suceed) {
      onSubmitted()
    } else {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={() => {}}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={() => handleClose()}>
          <CloseCircleIcon />
        </div>
        {isSubmitting || initialLoading ? (
          <div className={styles.confirmPassword}>
            <Spinner />
            {verifyResult ? (
              <p className={styles.confirmDepositDesc}>Confirmation Pending</p>
            ) : (
              <h3 className={styles.modalTitle}>Checking if a balance report is required</h3>
            )}
          </div>
        ) : failed ? (
          <div className={styles.confirmPassword}>
            <RedAlertIcon />
            <h3 className={styles.modalTitle}>{failed}</h3>
          </div>
        ) : (
          <div className={styles.confirmPassword}>
            <Spinner />
          </div>
        )}
      </Dialog.Panel>
    </Modal>
  )
}
