import { FC, useState } from 'react'
import { Helmet } from 'react-helmet'
import { KeystoreT } from 'types'
import { useUser, useCurrentValidator, useSDK, useNetworkBasedLinkFactories } from 'hooks'
import { useParams } from 'react-router-dom'
import { ContainerLayout } from 'components/layouts'
import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-up-right.svg'
import { ReactComponent as EncryptionDecryptionIcon } from 'assets/images/encryption-decryption.svg'
import {
  StepSection,
  Button,
  UploadKeystore,
  PasswordSection,
  ErrorModal,
  FinalMessage
} from 'components/shared'
import { shortenStr } from 'helpers/string'
import { parseFileAsJson, noty, notifyHash } from 'utils/global'

const EncryptPage: FC = () => {
  const STEPS = {
    UPLOAD_KEYSTORE: 1,
    ENCRYPT_KEY: 2,
    FINAL: 3
  } as const

  const params = useParams()
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { isUserDataLoading, refetchUserData } = useUser()
  const { validator: currentValidator } = useCurrentValidator()

  const [encryptionTxLink, setEncryptionTxLink] = useState('')
  const [currentStep, setCurrentStep] = useState<number>(STEPS.UPLOAD_KEYSTORE)
  const [keystoreFile, setKeyStoreFile] = useState<File | null>(null)
  const [keystorePassword, setKeystorePassword] = useState('')
  const [keystorePasswordErrorTitle, setKeystorePasswordErrorTitle] = useState('')
  const [isIncorrectPasswordModalVisible, setIsIncorrectPasswordModalVisible] = useState(false)
  const [isEncryptionLoading, setIsEncryptionLoading] = useState(false)
  const [isKeystorePasswordValidating, setIsKeystorePasswordValidating] = useState(false)

  const validatorId = (params['id'] as string) || ''
  const isPageLoading = isUserDataLoading

  const uploadKeystoreStepStatus = currentStep === STEPS.UPLOAD_KEYSTORE ? 'active' : 'done'

  const encryptKeyStatus = (() => {
    if (currentStep < STEPS.ENCRYPT_KEY) return 'normal'
    if (currentStep > STEPS.ENCRYPT_KEY) return 'done'
    return 'active'
  })()

  const handleUploadedKeystore = (file: File) => {
    if (!file) return
    setKeyStoreFile(file)
  }

  const handleKeystoreClear = () => {
    setKeyStoreFile(null)
    setKeystorePassword('')
  }

  const handleKeystorePasswordConfirm = async () => {
    if (!sdk) return

    setIsKeystorePasswordValidating(true)
    const keystore = await parseFileAsJson<KeystoreT>(keystoreFile as File)

    let isValid = true
    try {
      isValid = await sdk.cip.validateBLSKeystore(keystore, keystorePassword, validatorId)
      if (!isValid) {
        setKeystorePasswordErrorTitle(
          "Wrong keystore provided. It's not related to this validator."
        )
      }
    } catch (e) {
      setKeystorePasswordErrorTitle('Incorrect password')
      isValid = false
    } finally {
      setIsKeystorePasswordValidating(false)
    }

    if (isValid) {
      setCurrentStep(STEPS.ENCRYPT_KEY)
    } else {
      setIsIncorrectPasswordModalVisible(true)
    }
  }

  const handleEncryption = async () => {
    if (!sdk) return

    setIsEncryptionLoading(true)

    const keystore = await parseFileAsJson<KeystoreT>(keystoreFile as File)

    try {
      const tx = await sdk.cip.reEncrypt(
        validatorId,
        currentValidator?.stakeHouseMetadata?.id,
        keystore,
        keystorePassword
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
      }
    } finally {
      setIsEncryptionLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Secure Validator - Stakehouse</title>
      </Helmet>
      <ContainerLayout
        title="Secure your validator"
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
            KNOT {shortenStr(validatorId, 12, 4)} has been securely encrypted
          </FinalMessage>
        ) : (
          <div className="flex flex-col justify-center gap-6">
            <StepSection
              title="Upload your validator keystore file"
              number={STEPS.UPLOAD_KEYSTORE}
              state={uploadKeystoreStepStatus}>
              <UploadKeystore
                omitDepositObject
                tooltip="This is a .json file which was downloaded in Easy Mode or generated in Expert Mode."
                onNextStep={handleUploadedKeystore}
                onClear={handleKeystoreClear}
              />

              <PasswordSection
                value={keystorePassword}
                label="Enter your validator password"
                disabled={!keystoreFile}
                loading={isKeystorePasswordValidating}
                loadingContent="Processing..."
                tooltip="Enter your validator keystore password that was created when staking your validator."
                onChange={setKeystorePassword}
                onConfirm={handleKeystorePasswordConfirm}
              />

              <ErrorModal
                open={isIncorrectPasswordModalVisible}
                title={keystorePasswordErrorTitle}
                onClose={() => setIsIncorrectPasswordModalVisible(false)}
                onAction={() => setIsIncorrectPasswordModalVisible(false)}
                actionButtonContent="Try Again"
              />
            </StepSection>

            <StepSection
              title="Backup your validator signing key"
              number={STEPS.ENCRYPT_KEY}
              state={encryptKeyStatus}
              inside
              tooltip="This will encrypt and store your validator key on the Ethereum blockchain.">
              <Button
                borderless
                style={{ padding: '8px 24px' }}
                disabled={isEncryptionLoading}
                onClick={handleEncryption}>
                {isEncryptionLoading ? 'Processing...' : 'Backup'}
              </Button>
            </StepSection>
          </div>
        )}
      </ContainerLayout>
    </>
  )
}

export default EncryptPage
