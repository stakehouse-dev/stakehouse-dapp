import { FC, useState, useEffect } from 'react'
import { ValidatorT } from 'types'
import { TCipStatus } from 'types/cip'
import { Link } from 'react-router-dom'
import { useSDK, useBackupFileDownloadsMapStorage } from 'hooks'
import { Button } from 'components/shared'
import { isValidatorDerivativesMinted, isRageQuitted } from 'utils/validators'

export interface CipStatusColumnProps {
  validator: ValidatorT
}

const CipStatusColumn: FC<CipStatusColumnProps> = ({ validator }) => {
  const { sdk } = useSDK()
  const { isBackupFileDownloaded } = useBackupFileDownloadsMapStorage()
  const [cipStatus, setCipStatus] = useState<TCipStatus>(TCipStatus.Loading)

  const isBackupDownloaded = isBackupFileDownloaded(validator.id, cipStatus)

  useEffect(() => {
    loadCipStatus()
  }, [validator])

  async function loadCipStatus() {
    if (!sdk) return

    try {
      const response = await sdk.cip.getDecryptionState(validator.id)
      setCipStatus(response)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {!isValidatorDerivativesMinted(validator) || isRageQuitted(validator) ? (
        <div className="text-grey600">--</div>
      ) : (
        <>
          {cipStatus === TCipStatus.Loading ? (
            <div className="font-normal text-grey600">Processing...</div>
          ) : cipStatus === TCipStatus.RecoveryPending ? (
            <div className="font-normal">Recovery Pending</div>
          ) : cipStatus === TCipStatus.DownloadReady && !isBackupDownloaded ? (
            <Link to={`/download-backup/${validator.id}`}>
              <Button variant="text-primary">Download Available</Button>
            </Link>
          ) : cipStatus === TCipStatus.ReEncryptionRequired ? (
            <Link to={`/encrypt/${validator.id}`}>
              <Button variant="text-danger">Re-Encryption Required</Button>
            </Link>
          ) : (
            <div className="font-normal text-grey600">Fully Secured</div>
          )}
        </>
      )}
    </>
  )
}

export default CipStatusColumn
