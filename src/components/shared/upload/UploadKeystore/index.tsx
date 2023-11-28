import Dropzone from '../../Dropzone'
import { Tooltip } from '../../Tooltip'
import { ErrorModal } from '../../Modal/ErrorModal'
import { FC, useState, ReactNode } from 'react'
import { DepositObjectT, KeystoreT } from 'types'
import { parseFileAsJson } from 'utils/global'

export interface UploadKeystoreProps {
  onNextStep: (_file: File) => void
  depositObject?: DepositObjectT
  omitDepositObject?: boolean
  disabled?: boolean
  tooltip?: ReactNode
  onClear?: () => void
}

export const UploadKeystore: FC<UploadKeystoreProps> = ({
  onNextStep,
  depositObject,
  disabled,
  tooltip,
  omitDepositObject,
  onClear = () => {}
}) => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleUploadFile = async (_file: File) => {
    const keystore = await parseFileAsJson<KeystoreT>(_file)
    if (
      (omitDepositObject && keystore.pubkey) ||
      (depositObject && keystore.pubkey === depositObject[0].pubkey)
    ) {
      setUploadedFile(_file)
      onNextStep(_file)
    } else {
      setIsErrorModalOpen(true)
    }
  }

  const handleUploadedFileClear = () => {
    setUploadedFile(null)
    onClear()
  }

  return (
    <>
      <Dropzone
        uploadedFile={uploadedFile}
        onChange={handleUploadFile}
        disabled={disabled}
        size="sm"
        onClear={handleUploadedFileClear}>
        <div className="flex items-center gap-2">
          <div>
            Drag and drop your <strong>keystore</strong> file here
          </div>
          <Tooltip message={tooltip} />
        </div>
      </Dropzone>
      <ErrorModal
        open={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Uploading Validator Failed"
        message="Please ensure you have uploaded the correct file."
        actionButtonContent="Try again"
        onAction={() => setIsErrorModalOpen(false)}
      />
    </>
  )
}
