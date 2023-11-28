import { FC } from 'react'
import { Dialog } from '@headlessui/react'

import { Button, Modal } from 'components/shared'

import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import styles from './styles.module.scss'
import { ReactComponent as BlueAlertIcon } from 'assets/images/icon-alert-blue.svg'
import { useNavigate } from 'react-router-dom'

interface IProps {
  open: boolean
  onClose: () => void
}

export const ModalExitValidatorSuccess: FC<IProps> = ({ open, onClose }) => {
  const navigate = useNavigate()
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <h3 className={styles.confirmPasswordHeader}>Withdrawal process initiated succesfully</h3>
          <p className={styles.confirmDepositDesc}>
            It might take some time to broadcast an exit. <br /> Please try after some time.
          </p>
          <div className="w-full flex flex-col justify-center mt-2 items-center gap-4">
            <Button onClick={() => navigate('/')} size="lg" className="px-4">
              Home
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
