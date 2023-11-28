import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useBlockNumber } from 'wagmi'

import { Button, ErrorModal, Spinner } from 'components/shared'
import { ValidatorLifecycleStatuses, ValidatorT } from 'types'
import { ReactComponent as ArrowRightIcon } from 'assets/images/icon-arrow-right-gray.svg'
import { useNavigate } from 'react-router-dom'
import { useUser } from 'hooks'
import { ModalReportWithdrawal } from '../Modals/ModalReportWithdrawal'
import { isLSDValidator } from 'lib/isLSDValidator'

interface IProps {
  validator: ValidatorT
  knotData: any
  onMint: (validator: ValidatorT) => void
  report: any
}

const StatusColumn: FC<IProps> = ({ validator, knotData, onMint, report }) => {
  const { data: currentBlock } = useBlockNumber()
  const navigate = useNavigate()
  const [isReadyToQuit, setIsReadyToQuit] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { userAddress } = useUser()
  const [error, setError] = useState('')

  const rageQuitedValidators: string[] = useMemo(() => {
    const stringValue = localStorage.getItem('ragequit')
    if (stringValue) {
      return JSON.parse(stringValue) as string[]
    }

    return []
  }, [])

  const reportedValidators: string[] = useMemo(() => {
    const stringValue = localStorage.getItem('reported-withdrawal')
    if (stringValue) {
      return JSON.parse(stringValue) as string[]
    }

    return []
  }, [])

  useEffect(() => {
    if (report) {
      const { exitEpoch, currentCheckpointEpoch } = report
      if (
        Number(exitEpoch) - Number(currentCheckpointEpoch) <= 0 &&
        exitEpoch != '18446744073709551615'
      )
        setIsReadyToQuit(true)
    }
  }, [report, rageQuitedValidators])

  const status = useMemo(() => {
    const lifecycleStatus = validator.lifecycleStatus
    const newIndexId =
      knotData?.savETHIndexes && knotData.savETHIndexes.length > 0
        ? knotData.savETHIndexes[0].id
        : 0

    if (
      !currentBlock ||
      !validator.mintFromBlockNumber ||
      currentBlock < validator.mintFromBlockNumber
    )
      return 'PENDING'

    if (lifecycleStatus === ValidatorLifecycleStatuses.exited) return 'RAGE QUIT'
    if (lifecycleStatus === ValidatorLifecycleStatuses.unstaked) return 'UNSTAKED'

    if (isReadyToQuit) return 'READY_TO_QUIT'
    if (rageQuitedValidators.includes(validator.id)) return 'EXITING'

    if (lifecycleStatus === ValidatorLifecycleStatuses.depositCompleted) return 'MINTABLE'

    if (lifecycleStatus === ValidatorLifecycleStatuses.derivativesMinted) {
      if (validator.knotMetadata?.isPartOfIndex) {
        if (newIndexId === validator.knotMetadata?.savETHIndexId) {
          return 'in my savETH'
        } else {
          return 'MINTED'
        }
      } else {
        return 'WITHDRAWN'
      }
    }

    return 'PENDING'
  }, [validator, knotData, currentBlock, rageQuitedValidators, isReadyToQuit])

  const handleExiting = async () => {
    if (reportedValidators.includes(validator.id))
      navigate(`/exit-validator/${validator.id}/status`)
    else {
      setIsOpen(true)
    }
  }

  const handleReadyToQuit = async () => {
    if (await isLSDValidator(validator.id, userAddress)) {
      setError('This is an LSD validator. Please continue the withdrawals from the LSD dapp')
    } else navigate(`/exit-validator/${validator.id}/status`)
  }
  return (
    <>
      {status === 'PENDING' && <span className="text-grey500">Pending</span>}
      {status === 'EXITING' && (
        <div
          className="text-white py-1 px-2 rounded-full flex gap-1 items-center cursor-pointer bg-grey750"
          onClick={handleExiting}>
          Exiting <ArrowRightIcon />
        </div>
      )}
      {status === 'MINTABLE' && (
        <Button variant="primary" onClick={() => onMint(validator)}>
          Minting Available
        </Button>
      )}
      {status === 'MINTED' && <span className="text-grey500">Minted</span>}
      {status === 'WITHDRAWN' && <span className="text-grey500">Withdrawn</span>}
      {status === 'in my savETH' && <span className="text-grey500">Indexed</span>}
      {status === 'RAGE QUIT' && <span className="text-grey500">Rage Quit</span>}
      {status === 'UNSTAKED' && <span className="text-grey500">Unstaked</span>}
      {status === 'READY_TO_QUIT' && (
        <div
          className="text-white py-1 px-2 rounded-full flex gap-1 items-center cursor-pointer bg-grey750"
          onClick={handleReadyToQuit}>
          Ready to Quit <ArrowRightIcon />
        </div>
      )}
      <ModalReportWithdrawal validator={validator} open={isOpen} onClose={() => setIsOpen(false)} />
      <ErrorModal
        open={!!error}
        onClose={() => setError('')}
        title="Error"
        message={error}
        actionButtonContent="Go To LSD dapp"
        onAction={() => window.open('https://goerli-lsd.joinstakehouse.com/', '_blank')}
      />
    </>
  )
}

export default StatusColumn
