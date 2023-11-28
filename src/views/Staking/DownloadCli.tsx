import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ModalConfirmExpertGuide, StakingLayout } from 'components/app'
import { Button } from 'components/shared'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { STAKING_MODE } from 'types'

import { ReactComponent as LinuxIcon } from 'assets/images/icon-linux.svg'
import { ReactComponent as WindowsIcon } from 'assets/images/icon-windows.svg'
import { ReactComponent as MacIcon } from 'assets/images/icon-mac.svg'
import { ReactComponent as ArrowLeftIcon } from 'assets/images/arrow-left.svg'
import styles from './styles.module.scss'

const DownloadCli = () => {
  const navigate = useNavigate()
  const { setMode, setStep } = useContext(StakingStoreContext)
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const handleGoEasyMode = () => {
    setMode(STAKING_MODE.EASY)
    navigate('../validator-password')
  }

  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true)
  }
  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false)
  }

  const handleGoValidatorRegistration = () => {
    handleCloseConfirmModal()
    setStep(2)
    navigate('../expert-validator-registration')
  }

  return (
    <StakingLayout
      currentStep={1}
      title="Download the CLI"
      showSelectMode={true}
      onChangeMode={handleGoEasyMode}>
      <div className={styles.downloadCli}>
        <p className={styles.downloadCliDesc}>
          Follow the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.joinstakehouse.com/en/articles/6206942-how-do-i-stake-a-validator-using-the-ethereum-cli">
            Stakehouse Expert Mode
          </a>{' '}
          guide.
        </p>
        <div className={styles.downloadCliCards}>
          <a
            className={styles.downloadCliCard}
            href={'https://github.com/ethereum/eth2.0-deposit-cli#for-linux-or-macos-users'}
            target={'_blank'}
            rel={'noopener noreferrer'}>
            <LinuxIcon />

            <div>Linux</div>
            <div>Download</div>
          </a>

          <a
            className={styles.downloadCliCard}
            href={'https://github.com/ethereum/eth2.0-deposit-cli#for-windows-users'}
            target={'_blank'}
            rel={'noopener noreferrer'}>
            <WindowsIcon />
            <div>Windows</div>
            <div>Download</div>
          </a>
          <a
            className={styles.downloadCliCard}
            href={'https://github.com/ethereum/eth2.0-deposit-cli#for-linux-or-macos-users'}
            target={'_blank'}
            rel={'noopener noreferrer'}>
            <MacIcon />
            <div>Mac</div>
            <div>Download</div>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <div className="flex items-center gap-3 text-grey300 px-10 text-base font-medium">
              <ArrowLeftIcon />
              My Profile
            </div>
          </Link>
          <Button variant="primary" onClick={handleOpenConfirmModal} className="w-52 h-12">
            Continue
          </Button>
        </div>
      </div>
      <ModalConfirmExpertGuide
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleGoValidatorRegistration}
      />
    </StakingLayout>
  )
}

export default DownloadCli
