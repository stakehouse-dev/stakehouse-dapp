import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { StakingLayout, ModalConfirmPassword } from 'components/app'
import { Button, TextInput } from 'components/shared'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { BlockswapSDKContext } from 'context/BlockswapSDKContext'
import { STAKING_MODE } from 'types'

import { ReactComponent as ArrowLeftIcon } from 'assets/images/arrow-left.svg'
import styles from './styles.module.scss'

interface PasswordValidationT {
  required?: string | undefined
  length?: string | undefined
}

const ValidatorPassword = () => {
  const navigate = useNavigate()
  const { sdk } = useContext(BlockswapSDKContext)
  const { password, setPassword, setKeystore, setDepositObject, setStep, setMode, clearAllData } =
    useContext(StakingStoreContext)

  useEffect(() => {
    clearAllData()
  }, [])

  const [passwordValidationErr, setPasswordValidationErr] = useState<PasswordValidationT>({})
  const [confirmPassword, setConfirmPassword] = useState('')
  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [isConfirming, setConfirming] = useState(false)

  const handleGoToExpertMode = () => {
    setMode(STAKING_MODE.EXPOERT)
    navigate('../download-cli')
  }

  const handleConfirmPassword = async () => {
    if (!sdk) return

    setConfirming(true)
    try {
      const { depositObject, keystore } = await sdk.utils.generateCredentials(password)
      setDepositObject(depositObject)
      setKeystore(keystore)
      setStep(2)
      navigate('../validator-registration')
    } catch (err) {
      console.log('error: ', err)
    }
    setConfirming(false)
  }

  const handleOpenConfirmModal = () => {
    if (!password) {
      return setPasswordValidationErr({ required: 'Password is required' })
    } else if (password.length < 8) {
      return setPasswordValidationErr({ length: 'Your password must be 8 or more characters.' })
    }

    setOpenConfirmModal(true)
  }
  const handleCloseConfirmModal = () => setOpenConfirmModal(false)

  const canCreatePassword = useMemo(() => {
    return password && password === confirmPassword
  }, [password, confirmPassword])

  return (
    <StakingLayout
      currentStep={1}
      title="Create a Validator"
      showSelectMode={true}
      onChangeMode={handleGoToExpertMode}>
      <div className={styles.validatorPassword}>
        <p className={styles.validatorPasswordTitle}>Create a password for your ETH validator.</p>
        <TextInput
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="new-password"
          tooltip="Create a password to protect your validator keys. Your password will be used to create and access the keystore file containing your validator signing credentials."
          className={styles.input}
          value={password}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canCreatePassword) {
              handleOpenConfirmModal()
            }
          }}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordValidationErr.required && (
          <span className={styles.inputErr}>{passwordValidationErr.required}</span>
        )}
        {passwordValidationErr.length && (
          <span className={styles.inputErr}>{passwordValidationErr.length}</span>
        )}
        <TextInput
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          autoComplete="new-password"
          className={styles.input}
          value={confirmPassword}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter' && canCreatePassword) {
              handleOpenConfirmModal()
            }
          }}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className={styles.validatorPasswordBtnGroup}>
          <div className="flex-2 flex justify-center">
            <Link to="/">
              <div className="flex items-center gap-3 text-grey300 text-base font-medium">
                <ArrowLeftIcon />
                My Profile
              </div>
            </Link>
          </div>
          <div className="flex-3">
            <Button
              variant="primary"
              disabled={!canCreatePassword}
              onClick={handleOpenConfirmModal}
              className="w-full">
              <p className="py-1">Create Password</p>
            </Button>
          </div>
        </div>
      </div>
      <ModalConfirmPassword
        open={openConfirmModal}
        isLoading={isConfirming}
        onConfirm={handleConfirmPassword}
        onClose={handleCloseConfirmModal}
      />
    </StakingLayout>
  )
}

export default ValidatorPassword
