import { Dialog } from '@headlessui/react'

import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import { ReactComponent as BlueAlertIcon } from 'assets/images/icon-alert-blue.svg'

import styles from './styles.module.scss'
import { Button, Modal } from 'components/shared'

interface ModalConfirmExitProps {
  open: boolean
  txHash: string
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ModalBalanceReportSuccessful = ({
  open,
  isSubmitting,
  onClose,
  onConfirm
}: ModalConfirmExitProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <h3 className={styles.confirmPasswordHeader}>Balance Report successful</h3>
          <div className="w-full flex flex-col mt-2 items-center gap-4">
            <Button onClick={onConfirm} disabled={isSubmitting} size="lg" className="w-60">
              {isSubmitting ? 'Exiting...' : 'Exit Validator'}
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
