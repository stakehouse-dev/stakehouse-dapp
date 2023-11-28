import { useState } from 'react'

import { useSDK } from './useSDK'
import { BalanceReportT } from 'types'
import { BEACON_NODE_URL } from 'constants/chains'
import { noty } from 'utils/global'
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

  const { sdk } = useSDK()
  const account = useAccount()
  const { validators } = useUser()

  const handleReset = () => {
    setSubmitted(false)
    setSubmitting(false)
    setSignature(undefined)
  }

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
    setIsMultiRageQuit
  }
}
