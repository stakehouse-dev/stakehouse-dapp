import { FC, useState } from 'react'
import { Dialog } from '@headlessui/react'

import { Button, Checkbox, Modal, Tooltip } from 'components/shared'

import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import styles from './styles.module.scss'
import { ReactComponent as BlueAlertIcon } from 'assets/images/icon-alert-blue.svg'

interface IProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const ModalExitValidatorConfirm: FC<IProps> = ({ open, onClose, onConfirm }) => {
  const [firstCheck, setFirstCheck] = useState(false)
  const [secondCheck, setSecondCheck] = useState(false)

  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <h3 className={styles.confirmPasswordHeader}>Exit your validator</h3>
          <p className={styles.confirmDepositDesc}>
            {`I understand that before exiting my validator I'm fully aware of this implications:`}
          </p>
          <div className="flex flex-col w-full gap-2 text-left">
            <div className="flex gap-3 items-center">
              <Checkbox label="" checked={firstCheck} onChange={setFirstCheck} />
              <p className="text-grey300">This process is irreversible</p>
            </div>
            <div className="flex gap-3 items-center">
              <Checkbox label="" checked={secondCheck} onChange={setSecondCheck} />
              <p className="text-grey300">I must maintain operations during the waiting window</p>
            </div>
          </div>
          <div className="w-full flex justify-center mt-2 items-center gap-4">
            <Button onClick={onConfirm} size="lg" disabled={!firstCheck || !secondCheck}>
              Withdraw Validator
            </Button>
            <Button variant="text-primary">
              <div className="flex gap-2 text-grey300 items-center">
                Learn More
                <Tooltip message="The tooltip can provide the quick information..." />
              </div>
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalExitValidatorConfirm
