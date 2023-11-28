import { FC, useState } from 'react'
import {
  ModalDialog,
  DefaultModalView,
  LoadingModalView,
  Button,
  Tooltip,
  CompletedTxView,
  ErrorModalView
} from 'components/shared'
import { BigNumber } from 'ethers'
import {
  weiToEthNum,
  cutDecimals,
  notifyHash,
  noty,
  isTxRejectedByUser,
  handleErr
} from 'utils/global'
import { isValidatorDETHWithdrawable, handleAddTokenToWallet } from 'utils/validators'
import { useUser, useSDK, useNetworkBasedLinkFactories } from 'hooks'
import styles from './styles.module.scss'
import { BalanceReportT } from 'types'
import { BEACON_NODE_URL } from 'constants/chains'
import { useNavigate } from 'react-router-dom'
import { ModalDialogWithoutMinHeight } from 'components/shared/Modal/ModalDialogWithoutMinHeight'

export interface ModalReportWithdrawalProps {
  open: boolean
  onClose: () => void
  validator: any
  fromIndex?: boolean
  indexedOnly?: boolean
}

export const ModalReportWithdrawal: FC<ModalReportWithdrawalProps> = ({
  open,
  onClose,
  validator,
  fromIndex = false,
  indexedOnly = false
}) => {
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<{ hash: string } | null>(null)
  const [withdrawalError, setWithdrawalError] = useState('')

  const navigate = useNavigate()

  const withdrawTxLink = (() => {
    if (!withdrawResult) return ''
    return makeEtherscanLink(withdrawResult.hash)
  })()

  async function handleClick() {
    setIsWithdrawLoading(true)

    try {
      const stakehouseAddress = validator.stakeHouseMetadata?.id
      const finalisedEpochReport = await sdk?.balanceReport.getFinalisedEpochReport(
        BEACON_NODE_URL,
        validator.id
      )
      const authenticateReportResult: BalanceReportT = await sdk?.balanceReport.authenticateReport(
        BEACON_NODE_URL,
        finalisedEpochReport
      )
      const tx = await sdk?.withdrawal.reportVoluntaryWithdrawal(
        stakehouseAddress,
        authenticateReportResult
      )
      notifyHash(tx.hash)
      await tx.wait(1)
      setWithdrawResult(tx)

      let reportedValidators
      const stringValue = localStorage.getItem('reported-withdrawal')

      if (stringValue) reportedValidators = JSON.parse(stringValue)

      if (reportedValidators) {
        reportedValidators = [...reportedValidators, validator.id]
      } else {
        reportedValidators = [validator.id]
      }
      localStorage.setItem('reported-withdrawal', JSON.stringify(reportedValidators))

      setWithdrawalError('')
    } catch (err) {
      console.log(err)
      setIsWithdrawLoading(false)
      setWithdrawalError(
        'It might take some time to broadcast an exit. Please try after some time.'
      )
      return
    } finally {
      setIsWithdrawLoading(false)
    }
  }

  function handleClose() {
    setWithdrawResult(null)
    setWithdrawalError('')
    onClose()
  }

  return (
    <ModalDialogWithoutMinHeight open={open} onClose={handleClose}>
      {isWithdrawLoading ? (
        <LoadingModalView title="Confirmation Pending" />
      ) : withdrawalError ? (
        <ErrorModalView
          title="Failed to report voluntary withdrawal"
          message={withdrawalError}
          actionButtonContent="Retry"
          onAction={handleClick}
        />
      ) : withdrawResult ? (
        <CompletedTxView
          message="Report voluntary withdrawal successful."
          txLink={withdrawTxLink}
          goToContent="Proceed"
          goToLink={`/exit-validator/${validator.id}/status`}
        />
      ) : (
        <DefaultModalView title="Report voluntary withdrawal" className="w-full">
          <div className="mb-5">
            <div className={styles.textLabel}>
              Report voluntary withdrawal to the execution layer and proceed with withdrawal.
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleClick}>
            Confirm
          </Button>
        </DefaultModalView>
      )}
    </ModalDialogWithoutMinHeight>
  )
}
