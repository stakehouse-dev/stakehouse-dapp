import { FC, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { TCipStatus } from 'types/cip'
import { saveAs } from 'file-saver'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser, useSDK, useBackupFileDownloadsMapStorage } from 'hooks'
import { ContainerLayout } from 'components/layouts'
import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-up-right.svg'
import { ReactComponent as EncryptionDecryptionIcon } from 'assets/images/encryption-decryption.svg'
import { UploadRecoveryKey } from 'components/app'
import { StepSection, ConfirmModal, Button, FinalMessage } from 'components/shared'
import { noty, makeJsonFile, makeKeystoreFilename } from 'utils/global'

const DownloadPage: FC = () => {
  const STEPS = {
    UPLOAD_RECOVERY_KEY: 1,
    DOWNLOAD_BACKUP_FILE: 2,
    FINAL: 3
  } as const

  const params = useParams()
  const navigate = useNavigate()
  const { sdk } = useSDK()
  const { backupFileDownloadsMap, saveBackupFileDownloadsMap, isBackupFileDownloaded } =
    useBackupFileDownloadsMapStorage()
  const { isUserDataLoading, refetchUserData } = useUser()
  const [cipStatus, setCipStatus] = useState<TCipStatus>(TCipStatus.Loading)

  const [currentStep, setCurrentStep] = useState<number>(STEPS.UPLOAD_RECOVERY_KEY)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const [AESPrivateKey, setAESPrivateKey] = useState('')
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false)
  const [isDownloadLoading, setIsDownloadLoading] = useState(false)

  const validatorId = (params['id'] as string) || ''
  const isPageLoading = isUserDataLoading || cipStatus === TCipStatus.Loading

  const uploadRecoveryKeyStepStatus = currentStep === STEPS.UPLOAD_RECOVERY_KEY ? 'active' : 'done'
  const downloadBackupFileStepStatus = (() => {
    if (currentStep < STEPS.DOWNLOAD_BACKUP_FILE) return 'normal'
    if (currentStep > STEPS.DOWNLOAD_BACKUP_FILE) return 'done'
    return 'active'
  })()

  useEffect(() => {
    if (validatorId && sdk) {
      checkCipStatus()
    }
  }, [validatorId, sdk])

  async function checkCipStatus() {
    if (!sdk || !validatorId) return

    try {
      const response = await sdk.cip.getDecryptionState(validatorId)

      if (response !== TCipStatus.DownloadReady || isBackupFileDownloaded(validatorId, response)) {
        navigate('/', { replace: true })
      }

      setCipStatus(response)
    } catch (e) {
      console.error(e)
    }
  }

  const handleUploadedRecoveryKey = (file: File, privateKey: string) => {
    if (!file) return
    setAESPrivateKey(privateKey)
    setCurrentStep(STEPS.DOWNLOAD_BACKUP_FILE)
  }

  const handleRecoveryKeyClear = () => {
    setAESPrivateKey('')
  }

  async function handleDownload(password: string, showError: () => void) {
    if (!sdk) return

    if (password.length < 8) {
      showError()
      return
    }

    setIsDownloadLoading(true)

    try {
      const blsSigningKey = await sdk.cip.aggregateSharedPrivateKeys(AESPrivateKey, validatorId)
      const keystore = await sdk.cip.formBLSKeystore(blsSigningKey, password)

      const keystoreBlob = makeJsonFile(keystore!, makeKeystoreFilename())
      saveAs(keystoreBlob!, keystoreBlob!.name)

      setCurrentStep(STEPS.FINAL)
      setIsDownloadModalVisible(false)

      saveBackupFileDownloadsMap({
        ...backupFileDownloadsMap,
        [validatorId]: Date.now()
      })

      refetchUserData()
      setIsDownloaded(true)
    } catch (err) {
      if (err instanceof Error) {
        noty(err.message)
      } else {
        console.error(err)
      }
    } finally {
      setIsDownloadLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Download Backup - Stakehouse</title>
      </Helmet>
      <ContainerLayout
        title="Download the validator keystore"
        loading={isPageLoading}
        back
        footer={
          <div className="flex justify-center">
            <a
              href="https://help.joinstakehouse.com/en/articles/6326534-what-is-the-common-interest-protocol"
              target={'_blank'}
              rel={'noreferrer noopener'}
              className="flex items-center gap-1 text-sm text-primary700 transition hover:opacity-75">
              Learn More
              <ArrowTopRightIcon style={{ stroke: '#41C681' }} />
            </a>
          </div>
        }>
        {isDownloaded ? (
          <FinalMessage
            icon={<EncryptionDecryptionIcon />}
            buttonContent="My Profile"
            buttonLink="/">
            You have downloaded your
            <br />
            validator keystore file.
          </FinalMessage>
        ) : (
          <div className="flex flex-col justify-center gap-6">
            <StepSection
              title="Upload your validator recovery key"
              number={STEPS.UPLOAD_RECOVERY_KEY}
              state={uploadRecoveryKeyStepStatus}>
              <UploadRecoveryKey
                blsPublicKey={validatorId}
                onUpload={handleUploadedRecoveryKey}
                onClear={handleRecoveryKeyClear}
                tooltip="This key is needed to download your validator’s keystore file."
              />
            </StepSection>

            <StepSection
              title="Download the validator keystore"
              number={STEPS.DOWNLOAD_BACKUP_FILE}
              state={downloadBackupFileStepStatus}
              tooltip="Once downloaded, keep this file safe. It is your validator's signing key."
              inside>
              <Button
                disabled={isDownloadLoading}
                borderless
                onClick={() => setIsDownloadModalVisible(true)}>
                {isDownloadLoading ? 'Wait...' : 'Download'}
              </Button>

              <ConfirmModal
                open={isDownloadModalVisible}
                onClose={() => setIsDownloadModalVisible(false)}
                onConfirm={handleDownload}
                loading={isDownloadLoading}
                allowLoadingView
                loadingViewTitle="Preparing for download..."
                requestPassword
                title="NONE"
                label="Confirm validator keystore password"
                tooltip="Without this password you will not be able to download your keystore file."
                confirmButtonContent="Confirm"
                errorTitle="Your password must be 8 or more characters"
              />
            </StepSection>
          </div>
        )}
      </ContainerLayout>
    </>
  )
}

export default DownloadPage
