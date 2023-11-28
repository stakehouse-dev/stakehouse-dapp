import { FC, ReactNode } from 'react'
import Modal from '../index'
import { Dialog } from '@headlessui/react'
import styles from './styles.module.scss'
import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'

interface ModalDialogProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  controlsClosableOnly?: boolean
}

export const ModalDialogWithoutMinHeight: FC<ModalDialogProps> = ({
  children,
  open,
  onClose,
  controlsClosableOnly = false
}) => {
  return (
    <Modal open={open} onClose={controlsClosableOnly ? () => {} : onClose}>
      <Dialog.Panel className={styles.modalDialog}>
        <CloseCircleIcon className={styles.closeIcon} onClick={onClose} />

        {children}
      </Dialog.Panel>
    </Modal>
  )
}
