import { useState, ReactNode } from 'react'
import { RecoveryKeyT } from 'types/cip'
import { parseFileAsJson } from 'utils/global'
import { Tooltip, ErrorModal, ConfirmModal, Dropzone } from 'components/shared'
import { useSDK } from 'hooks'

interface Props {
  blsPublicKey: string
  onUpload: (_file: File, privateKey: string) => void
  disabled?: boolean
  tooltip?: ReactNode
  onClear?: () => void
}

const UploadRecoveryKey = ({
  blsPublicKey,
  onUpload,
  disabled,
  tooltip,
  onClear = () => {}
}: Props) => {
  const { sdk } = useSDK()

  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [tempUploadedFile, setTempUploadedFile] = useState<File | null>(null)
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false)
  const [isAESPrivateKeyLoading, setIsAESPrivateKeyLoading] = useState(false)
  const [clearSelection, setClearSelection] = useState<() => void>(() => () => {})
  const [recoveryPasswordError, setRecoveryPasswordError] = useState('')

  const handleUploadFile = async (_file: File, clear: () => void) => {
    setClearSelection(() => clear)

    const recoveryKey = await parseFileAsJson<RecoveryKeyT>(_file)

    if (recoveryKey.id && recoveryKey.aesPublicKey) {
      setTempUploadedFile(_file)
      setIsConfirmModalVisible(true)
    } else {
      setIsErrorModalVisible(true)
    }
  }

  const handleUploadedFileClear = () => {
    setUploadedFile(null)
    setTempUploadedFile(null)
    onClear()
  }

  const handleRecoveryPasswordConfirm = async (password: string, showError: () => void) => {
    if (!sdk) return

    setIsAESPrivateKeyLoading(true)
    const recoveryKey = await parseFileAsJson<RecoveryKeyT>(tempUploadedFile as File)

    let privateKey = ''
    try {
      privateKey = await sdk.cip.unlockAESPrivateKey(recoveryKey, password, blsPublicKey)
    } catch (e) {
      const customErrors = (await sdk.constants).customErrors
      if (e instanceof Error && e.message == customErrors.INCORRECT_AES_KEYSTORE) {
        setRecoveryPasswordError('Provided recovery key is not related to selected validator')
      } else {
        setRecoveryPasswordError('Incorrect password')
      }
      privateKey = ''
    } finally {
      setIsAESPrivateKeyLoading(false)
    }

    if (privateKey) {
      setUploadedFile(tempUploadedFile)
      onUpload(tempUploadedFile as File, privateKey)
      setIsConfirmModalVisible(false)
    } else {
      showError()
    }
  }

  function handleConfirmModalClose() {
    clearSelection()
    setIsConfirmModalVisible(false)
  }

  return (
    <>
      <Dropzone
        uploadedFile={uploadedFile}
        onChange={handleUploadFile}
        disabled={disabled}
        size="sm"
        onClear={handleUploadedFileClear}>
        <div className="flex items-center gap-2.5">
          <div>
            Drag and drop your <strong>recovery</strong> key
          </div>
          <Tooltip message={tooltip} />
        </div>
      </Dropzone>

      <ConfirmModal
        open={isConfirmModalVisible}
        onClose={handleConfirmModalClose}
        onConfirm={handleRecoveryPasswordConfirm}
        requestPassword
        title={''}
        label="Confirm validator password"
        tooltip="Enter your validator's password."
        confirmButtonContent="Confirm"
        loading={isAESPrivateKeyLoading}
        allowLoadingView
        loadingViewTitle="Confirming the password..."
        errorTitle={recoveryPasswordError}
      />

      <ErrorModal
        open={isErrorModalVisible}
        title="Uploading Recovery Key Failed"
        message={
          <span>
            Please ensure you have uploaded
            <br /> the correct file.
          </span>
        }
        onClose={() => setIsErrorModalVisible(false)}
        onAction={() => setIsErrorModalVisible(false)}
        actionButtonContent={'Try Again'}
      />
    </>
  )
}

export default UploadRecoveryKey
