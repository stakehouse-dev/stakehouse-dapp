import { FC } from 'react'
import { Dialog } from '@headlessui/react'

import { Button, Modal } from 'components/shared'

import { ReactComponent as RedEthIcon } from 'assets/images/icon-eth-big-red.svg'
import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import styles from './styles.module.scss'

interface IProps {
  open: boolean
  onClose: () => void
}

const ModalInsufficientBalance: FC<IProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <RedEthIcon width={48} height={48} />
        <p className={styles.modalTitle}>Not enough ETH</p>
        <p className={styles.insufficientDesc}>
          It requires 32 ETH to solo stake.
          <br />
          <br />
          To stake with any amount, use
          <a
            href="https://lsd.joinstakehouse.com"
            target="_blank"
            className="text-primary"
            rel="noreferrer">
            <span> Three Pool Staking.</span>
          </a>
        </p>
        <a href="https://lsd.joinstakehouse.com" target="_blank" rel="noreferrer">
          <Button variant="primary" className="mt-4 w-80">
            Stakehouse LSD Networks
          </Button>
        </a>
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalInsufficientBalance
