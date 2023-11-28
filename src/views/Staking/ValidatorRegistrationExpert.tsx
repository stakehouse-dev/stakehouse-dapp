import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlaggedWallet } from 'hooks/useFlaggedWallet'
import TransactionRejectedModal from 'components/app/Modals/TransactionRejectedModal'

import {
  DepositSection,
  KeystoreSection,
  ModalDepositConfirmEasy,
  StakingLayout,
  ValidatorRegisterCard
} from 'components/app'
import { Button } from 'components/shared'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { DepositObjectT, EXPERT_REGISTER_STEP, KeystoreT, STAKING_MODE } from 'types'

import styles from './styles.module.scss'

const ValidatorRegistrationExpert = () => {
  const navigate = useNavigate()
  const {
    mode,
    step,
    depositObject,
    setDepositObject,
    expertRegisterStep,
    setExpertRegisterStep,
    setStep,
    setKeystore
  } = useContext(StakingStoreContext)
  const isFlagged = useFlaggedWallet()
  const [blsAuthRes, setBlsAuthRes] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [openDepositConfirmModal, setOpenDepositConfirmModal] = useState(false)

  useEffect(() => {
    if (mode !== STAKING_MODE.EXPOERT) {
      return navigate('/')
    } else if (step === 1) {
      return navigate('../download-cli')
    }
  }, [])

  const handleDeposit = async () => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      setOpenModal(true)
      return
    }

    setOpenDepositConfirmModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleRegisterDepositObject = (obj: DepositObjectT | null) => {
    if (obj) {
      setDepositObject(obj)
      setExpertRegisterStep(EXPERT_REGISTER_STEP.UPLOADED_DEPOSIT_OBJECT)
    } else {
      setDepositObject(undefined)
      setExpertRegisterStep(EXPERT_REGISTER_STEP.INIT)
    }
  }

  const handleUploadedKeystore = async (keystore: KeystoreT, blsAuthRes: any) => {
    setKeystore(keystore)
    setBlsAuthRes(blsAuthRes)
    setExpertRegisterStep(EXPERT_REGISTER_STEP.UPLOADED_KEYSTORE)
  }

  const handleGoNext = () => {
    setStep(3)
    setOpenDepositConfirmModal(false)
    navigate('../final-step')
  }

  return (
    <StakingLayout currentStep={2} title="Validator Registration">
      <div className={styles.validatorRegistration}>
        <ValidatorRegisterCard
          active={expertRegisterStep < EXPERT_REGISTER_STEP.UPLOADED_KEYSTORE}
          done={expertRegisterStep > EXPERT_REGISTER_STEP.UPLOADED_DEPOSIT_OBJECT}
          stepNum={EXPERT_REGISTER_STEP.INIT}
          title="Register your validator"
          tooltip="Registering your validator allows Stakehouse to track balance increases and decreases to your validator. Stakehouse is non-custodial and does not hold your deposit data or keystore file.">
          <DepositSection
            onRegisterDepositObject={handleRegisterDepositObject}
            depositObject={depositObject}
          />
          <KeystoreSection
            disabled={expertRegisterStep !== EXPERT_REGISTER_STEP.UPLOADED_DEPOSIT_OBJECT}
            depositObject={depositObject}
            onNextStep={handleUploadedKeystore}
          />
        </ValidatorRegisterCard>
        <ValidatorRegisterCard
          title="Send 32 ETH to the Ethereum Deposit Contract"
          stepNum={2}
          active={expertRegisterStep === EXPERT_REGISTER_STEP.UPLOADED_KEYSTORE}
          done={expertRegisterStep === EXPERT_REGISTER_STEP.DONE}
          tooltip="This will route 32 ETH from your wallet to the Ethereum Deposit Contract">
          <Button variant="primary" className="w-full" onClick={() => handleDeposit()}>
            Deposit
          </Button>
          <ModalDepositConfirmEasy
            blsAuthRes={blsAuthRes}
            onApprove={handleGoNext}
            onClose={() => setOpenDepositConfirmModal(false)}
            open={openDepositConfirmModal}
            pubkey={depositObject ? depositObject[0].pubkey : ''}
          />
        </ValidatorRegisterCard>
      </div>
      <TransactionRejectedModal open={openModal} onClose={handleCloseModal} />
    </StakingLayout>
  )
}

export default ValidatorRegistrationExpert
