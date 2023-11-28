import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useSigner } from 'wagmi'
import { saveAs } from 'file-saver'
import { useFlaggedWallet } from 'hooks/useFlaggedWallet'
import TransactionRejectedModal from 'components/app/Modals/TransactionRejectedModal'
import {
  ModalDepositConfirm,
  StakingLayout,
  ValidatorKeyCard,
  ValidatorRegisterCard
} from 'components/app'
import { Button, Spinner } from 'components/shared'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { BlockswapSDKContext } from 'context/BlockswapSDKContext'
import {
  handleErr,
  makeDepositObjectFilename,
  makeJsonFile,
  makeKeystoreFilename,
  notifyHash,
  noty
} from 'utils/global'

import styles from './styles.module.scss'

const ValidatorRegistration = () => {
  const isFlagged = useFlaggedWallet()
  const navigate = useNavigate()
  const { data: signer } = useSigner()
  const [openModal, setOpenModal] = useState(false)
  const { address, connector: activeConnector } = useAccount()
  const { sdk } = useContext(BlockswapSDKContext)
  const {
    depositObject,
    keystore,
    password,
    step,
    easyRegisterStep,
    setEasyRegisterStep,
    setStep,
    setTxRegisterHash
  } = useContext(StakingStoreContext)

  const [isRegistering, setRegistering] = useState(false)
  const [isApproving, setApproving] = useState(false)
  const [downloadedDepositKey, setDownloadedDepositKey] = useState(false)
  const [openDepositModal, setOpenDepositModal] = useState(false)
  const [openDownloadSection, setOpenDownloadSection] = useState(false)

  const depositDataBlob = useMemo(
    () => makeJsonFile(depositObject!, makeDepositObjectFilename()),
    [depositObject]
  )
  const keystoreBlob = useMemo(() => makeJsonFile(keystore!, makeKeystoreFilename()), [keystore])

  useEffect(() => {
    if (easyRegisterStep > 3) {
      setStep(3)
      navigate('../final-step')
    }

    if (step < 2) {
      navigate('/')
    }
  }, [])

  const handleCloseDepositModal = () => setOpenDepositModal(false)

  const handleOpenDepositModal = async () => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      setOpenModal(true)
      return
    }

    setOpenDepositModal(true)
  }

  const handleRegister = async () => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      setOpenModal(true)
      return
    }
    if (!depositObject || !signer || !sdk) {
      noty('Cannot register, deposit object data is not available.')
      return navigate('../validator-password')
    }
    setRegistering(true)
    try {
      const [deposit] = depositObject
      const tx = await sdk.registerValidatorInitials(
        address,
        sdk.utils.add0x(deposit.pubkey),
        sdk.utils.add0x(deposit.signature)
      )
      notifyHash(tx.hash)
      await tx.wait()
      setEasyRegisterStep(2)
    } catch (err) {
      console.error(err)
      await handleErr(err)
    } finally {
      setRegistering(false)
    }
  }

  const handleApproveDeposit = async () => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      setOpenModal(true)
      return
    }

    if (!password || !keystore || !depositObject) {
      noty('Cannot continue')
      return navigate('../validator-password')
    }

    if (!sdk || !address || !signer || !activeConnector) return

    try {
      setOpenDepositModal(false)
      setApproving(true)
      const [deposit] = depositObject
      const provider = await activeConnector.getProvider()

      const depositor_signature_payload = await sdk.utils.getPersonalSignInitials(
        provider,
        sdk.utils.add0x(deposit.pubkey),
        sdk.utils.add0x(deposit.signature),
        address,
        activeConnector.name === 'WalletConnect'
      )
      const bls_authentication_response = await sdk.BLSAuthentication(
        password,
        keystore,
        depositObject,
        depositor_signature_payload
      )
      const tx = await sdk.registerValidator(address, bls_authentication_response)
      setTxRegisterHash(tx.hash)
      notifyHash(tx.hash)
      await tx.wait()
      setEasyRegisterStep(4)
      setStep(3)
      navigate('../final-step')
    } catch (err) {
      handleErr(err)
    }
    setApproving(false)
  }

  const handleDownloadKeyFile = (file: File | null, fileName: string) => {
    if (file) {
      saveAs(file)
    }

    if (fileName === 'deposit_data.json') {
      setDownloadedDepositKey(true)
    } else if (fileName === 'keystore.json') {
      setEasyRegisterStep(3)
    }
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  return (
    <StakingLayout currentStep={2} title="Validator Registration">
      <div className={styles.validatorRegistration}>
        <ValidatorRegisterCard
          active={easyRegisterStep === 1}
          done={easyRegisterStep > 1}
          stepNum={1}
          title="Register your validator"
          tooltip="Registering your validator allows Stakehouse to track balance increases and decreases to your validator. Stakehouse is non-custodial and does not hold your deposit data or keystore file."
          inside>
          {isRegistering ? (
            <Spinner size={32} />
          ) : (
            <Button variant="primary" onClick={handleRegister} className="w-36">
              Register
            </Button>
          )}
        </ValidatorRegisterCard>
        <ValidatorRegisterCard
          active={easyRegisterStep >= 2}
          done={false}
          stepNum={2}
          open={openDownloadSection}
          onClickHeader={() => {
            if (easyRegisterStep > 2) {
              setOpenDownloadSection((v) => !v)
            }
          }}
          tooltip="Keep these files safe."
          title="Download your validator keys">
          <div className="flex flex-col gap-2 w-full">
            <ValidatorKeyCard
              blob={depositDataBlob}
              name="deposit_data.json"
              onDownload={() => handleDownloadKeyFile(depositDataBlob, 'deposit_data.json')}
              downloaded={downloadedDepositKey}
            />
            <ValidatorKeyCard
              blob={keystoreBlob}
              name="keystore.json"
              onDownload={() => handleDownloadKeyFile(keystoreBlob, 'keystore.json')}
              disabled={!downloadedDepositKey}
              downloaded={easyRegisterStep > 2}
            />
          </div>
        </ValidatorRegisterCard>
        <ValidatorRegisterCard
          active={easyRegisterStep === 3}
          done={easyRegisterStep > 3}
          stepNum={3}
          tooltip="This will route 32 ETH from your wallet to the Ethereum Deposit Contract."
          title="Send 32 ETH to the Ethereum Deposit Contract">
          <Button
            variant="primary"
            disabled={isApproving}
            className="w-full"
            onClick={handleOpenDepositModal}>
            {isApproving ? 'Depositing' : 'Deposit'}
          </Button>
        </ValidatorRegisterCard>
        <ModalDepositConfirm
          open={openDepositModal}
          onClose={handleCloseDepositModal}
          onApprove={handleApproveDeposit}
          pubkey={depositObject?.[0].pubkey || ''}
        />
      </div>
      <TransactionRejectedModal open={openModal} onClose={handleCloseModal} />
    </StakingLayout>
  )
}

export default ValidatorRegistration
