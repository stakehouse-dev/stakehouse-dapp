import { FC, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'
import { saveAs } from 'file-saver'
import { useUser, useSDK, useCurrentValidator, useNetworkBasedLinkFactories } from 'hooks'
import { ContainerLayout } from 'components/layouts'
import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-up-right.svg'
import { ReactComponent as EncryptionDecryptionIcon } from 'assets/images/encryption-decryption.svg'
import {
  StepSection,
  ConfirmModal,
  Button,
  ActionableSection,
  PasswordSection,
  LoadingModal,
  FinalMessage
} from 'components/shared'
import { shortenStr } from 'helpers/string'
import { makeJsonFile, makeRecoveryKeyFilename, noty, notifyHash } from 'utils/global'

const DecryptPage: FC = () => {
  const STEPS = {
    CREATE_RECOVERY_KEY: 1,
    UNLOCK_RECOVERY_KEY: 2,
    FINAL: 3
  } as const

  const params = useParams()
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { isUserDataLoading, refetchUserData } = useUser()
  const { validator: currentValidator } = useCurrentValidator()

  const [encryptionTxLink, setEncryptionTxLink] = useState('')
  const [currentStep, setCurrentStep] = useState<number>(STEPS.CREATE_RECOVERY_KEY)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [recoveryPasswordError, setRecoveryPasswordError] = useState('')
  const [isPasswordConfirmModalVisible, setIsPasswordConfirmModalVisible] = useState(false)

  const [AESCredentials, setAESCredentials] = useState({ privateKey: '', publicKey: '' })
  const [isRecoveryKeyPreparationLoading, setIsRecoveryKeyPreparationLoading] = useState(false)
  const [recoveryKeyFile, setRecoveryKeyFile] = useState<File | null>(null)

  const [isLoadingModalVisible, setIsLoadingModalVisible] = useState(false)
  const [isDecryptionLoading, setIsDecryptionLoading] = useState(false)

  const validatorId = (params['id'] as string) || ''
  const isPageLoading = isUserDataLoading
  const isUnlockButtonDisabled = !recoveryKeyFile || isDecryptionLoading

  const createRecoveryKeyStepStatus = currentStep === STEPS.CREATE_RECOVERY_KEY ? 'active' : 'done'
  const unlockRecoveryKeyStepStatus = (() => {
    if (currentStep < STEPS.UNLOCK_RECOVERY_KEY) return 'normal'
    if (currentStep > STEPS.UNLOCK_RECOVERY_KEY) return 'done'
    return 'active'
  })()

  const downloadRecoveryKeyActionContent = (() => {
    if (isRecoveryKeyPreparationLoading) return 'Wait...'
    if (recoveryKeyFile) return 'Download again'
    return 'Download'
  })()

  function validateRecoveryPassword(password: string): boolean {
    if (!password.length) {
      setRecoveryPasswordError('Password is required')
      return false
    }

    if (password.length < 8) {
      setRecoveryPasswordError('Your password must be 8 or more characters.')
      return false
    }

    setRecoveryPasswordError('')
    return true
  }
  function handleRecoveryPasswordChange(password: string) {
    validateRecoveryPassword(password)
    setRecoveryPassword(password)
  }

  function handleRecoveryPasswordCreation() {
    if (validateRecoveryPassword(recoveryPassword)) {
      setIsPasswordConfirmModalVisible(true)
    }
  }

  function handleRecoveryPasswordConfirm() {
    setCurrentStep(STEPS.UNLOCK_RECOVERY_KEY)
    setIsPasswordConfirmModalVisible(false)
  }

  async function handleDownloadRecoveryKey() {
    if (!sdk) return

    if (recoveryKeyFile) {
      saveAs(recoveryKeyFile!, recoveryKeyFile!.name)
      return
    }

    let keystore
    setIsRecoveryKeyPreparationLoading(true)

    try {
      const credentials = await sdk.cip.generateAESCredentials()
      setAESCredentials(credentials)

      keystore = await sdk.cip.formAESKeystore(credentials.privateKey, recoveryPassword)
    } catch (e) {
      console.error('Failed to create keystore')
      return
    }

    const keystoreBlob = makeJsonFile(keystore!, makeRecoveryKeyFilename())
    saveAs(keystoreBlob!, keystoreBlob!.name)

    setIsRecoveryKeyPreparationLoading(false)
    setRecoveryKeyFile(keystoreBlob)
  }

  async function handleDecryption() {
    if (!sdk) return

    setIsDecryptionLoading(true)
    setIsLoadingModalVisible(true)

    try {
      const tx = await sdk.cip.applyForDecryption(
        validatorId,
        currentValidator?.stakeHouseMetadata?.id,
        AESCredentials.publicKey
      )

      notifyHash(tx.hash)
      await tx.wait()

      refetchUserData()
      setEncryptionTxLink(makeEtherscanLink(tx.hash))
    } catch (err) {
      const errBody = JSON.parse(JSON.stringify(err))

      if (errBody?.error?.code === -32603) {
        noty('Knot has been slashed')
      } else if (err instanceof Error) {
        noty(err.message)
      } else {
        console.error(err)
      }
    } finally {
      setIsDecryptionLoading(false)
      setIsLoadingModalVisible(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Recover Validator - Stakehouse</title>
      </Helmet>
      <ContainerLayout
        title="Create your validator recovery key"
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
        {encryptionTxLink ? (
          <FinalMessage
            icon={<EncryptionDecryptionIcon />}
            buttonContent="My Profile"
            buttonLink="/"
            txLink={encryptionTxLink}>
            Validator keystore recovery started for KNOT {shortenStr(validatorId, 12, 4)}
          </FinalMessage>
        ) : (
          <div className="flex flex-col justify-center gap-6">
            <StepSection
              title="Enter your validator password"
              number={STEPS.CREATE_RECOVERY_KEY}
              state={createRecoveryKeyStepStatus}
              tooltip="Enter the password you selected when creating your validator.">
              <PasswordSection
                value={recoveryPassword}
                onChange={handleRecoveryPasswordChange}
                onConfirm={handleRecoveryPasswordCreation}
                error={recoveryPasswordError}
                borderless
              />

              <ConfirmModal
                open={isPasswordConfirmModalVisible}
                onClose={() => setIsPasswordConfirmModalVisible(false)}
                onConfirm={handleRecoveryPasswordConfirm}
                requestPassword
                matchPassword={recoveryPassword}
                title={''}
                tooltip="Do not lose this password or file. You will need them to recover your validator key."
                label="Confirm your validator password"
                confirmButtonContent="Confirm"
                comment={<span className="text-danger">Keep this password safe.</span>}
              />
            </StepSection>

            <StepSection
              title="Download your validator access recovery file"
              number={STEPS.UNLOCK_RECOVERY_KEY}
              state={unlockRecoveryKeyStepStatus}>
              <ActionableSection
                className="w-full"
                label="Download your validator recovery key"
                tooltip="Keep this file safe, you will need it to recover your validator signing key."
                actionable
                disabled={isRecoveryKeyPreparationLoading}
                actionContent={downloadRecoveryKeyActionContent}
                onAction={handleDownloadRecoveryKey}
              />

              <Button
                disabled={isUnlockButtonDisabled}
                className="w-full"
                style={{ height: '56px' }}
                onClick={handleDecryption}>
                {isDecryptionLoading ? 'Processing...' : 'Send validator recovery request'}
              </Button>

              <LoadingModal
                title={'Confirmation pending'}
                open={isLoadingModalVisible}
                onClose={() => setIsLoadingModalVisible(false)}
              />
            </StepSection>
          </div>
        )}
      </ContainerLayout>
    </>
  )
}

export default DecryptPage
