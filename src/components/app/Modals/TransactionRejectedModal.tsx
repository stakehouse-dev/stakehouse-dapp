import { FC } from 'react'
import { Dialog } from '@headlessui/react'
import { Button, Modal } from 'components/shared'
import alertIcon from 'assets/images/alert-circle.svg'
import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import styles from './styles.module.scss'
import customStyles from './TransactionRejectedModal.module.scss'

interface IProps {
  open: boolean
  onClose: () => void
}

const TransactionRejectedModal: FC<IProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.customModalLayout}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={customStyles.content}>
          <img src={alertIcon} alt="" />
          <h1 className={customStyles.title}>Transaction Failed</h1>
          <p className={customStyles.description}>This wallet address is considered high risk.</p>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}

export default TransactionRejectedModal
