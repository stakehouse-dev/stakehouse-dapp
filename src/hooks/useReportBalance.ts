import { useState, useCallback, useMemo } from 'react'

import { useSDK } from './useSDK'
import { BalanceReportT } from 'types'
import { BEACON_NODE_URL } from 'constants/chains'
import { noty, notifyHash, bigToNum } from 'utils/global'
import { TEligibilityStatus } from 'types/ragequit'
import { customErrors } from 'lib/ragequit'
import { useAccount } from 'wagmi'
import { useUser } from './useUser'

export const useReportBalance = () => {
  const [isSubmitting, setSubmitting] = useState(false)
  const [isSubmitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<TEligibilityStatus>()
  const [signature, setSignature] = useState<BalanceReportT>()
  const [isMultiRageQuit, setIsMultiRageQuit] = useState<boolean>(false)
  const [topUpRequired, setTopUpRequired] = useState([])
  const [loadingTopup, setLoadingTopup] = useState(false)

  const { sdk } = useSDK()
  const account = useAccount()
  const { validators } = useUser()

  const handleReset = () => {
    setSubmitted(false)
    setSubmitting(false)
    setSignature(undefined)
  }

  const handleTopUpSlashedSlot = useCallback(
    async (blsPublicKey: string) => {
      if (!account?.address || !validators || !sdk) return

      setLoadingTopup(true)
      try {
        const stakeHouse = validators.filter(
          (item) => item.id.toLowerCase() == blsPublicKey.toLowerCase()
        )[0].stakeHouseMetadata?.id

        await Promise.all(
          topUpRequired.map(async ({ blsPublicKey, amount }) => {
            const tx = await sdk.utils.topUpSlashedSlot(
              stakeHouse,
              blsPublicKey,
              account?.address,
              amount,
              amount
            )
            notifyHash(tx.hash)
            await tx.wait()
          })
        )
      } catch (err) {
        console.log('handleTopUp error: ', err)
        noty('Failed to topup. Please retry')
        setSubmitting(false)
        setLoadingTopup(false)
        setTopUpRequired([])
      }

      setLoadingTopup(false)
      setTopUpRequired([])
    },
    [sdk, validators, account?.address, topUpRequired]
  )

  const totalTopupRequired = useMemo(() => {
    if (topUpRequired.length > 0) {
      let result = 0
      topUpRequired.forEach(({ amount }) => {
        result += bigToNum(amount)
      })
      return result
    }

    return 0
  }, [topUpRequired])

  const handleSubmit = async (blsPublicKey: string) => {
    if (!sdk) {
      return
    }
    if (validators.length > 0) {
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
        }

        const stakehouseAddress = validators.filter(
          (item) => item.id.toLowerCase() == blsPublicKey.toLowerCase()
        )[0].stakeHouseMetadata?.id

        try {
          try {
            const result = await sdk.utils.minimumTopUpRequired(stakehouseAddress, account?.address)
            if (result.length > 0) {
              setTopUpRequired(result)
              return
            }
          } catch (err) {
            console.log('minimumTopUpRequired error: ', err)
          }

          const result: boolean = await sdk.utils.rageQuitChecks(
            stakehouseAddress,
            account?.address,
            authenticateReportResult
          )

          if (result) {
            setStatus(TEligibilityStatus.Eligible)
          } else setStatus(TEligibilityStatus.Ineligible)
        } catch (e) {
          console.error(e)
          if (e === customErrors.COLLATERALIZED_KNOTS_NOT_ALLOWED) {
            setIsMultiRageQuit(true)
          } else if (e === customErrors.SETH_BALANCE_LT_12) {
            setStatus(TEligibilityStatus.IneligibleSETH)
          } else if (e === customErrors.DETH_BALANCE_LT_24) {
            setStatus(TEligibilityStatus.IneligibleDETH)
          } else setStatus(TEligibilityStatus.Ineligible)
        }
      } catch (err: any) {
        console.log('err: ', err)
        noty(err.message || err)
      }
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  return {
    handleSubmit,
    handleReset,
    isSubmitting,
    isSubmitted,
    signature,
    status,
    setSubmitted,
    isMultiRageQuit,
    setIsMultiRageQuit,
    handleTopUpSlashedSlot,
    totalTopupRequired,
    topUpRequired,
    setTopUpRequired,
    loadingTopup,
    setLoadingTopup
  }
}
