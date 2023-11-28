import { Dialog } from '@headlessui/react'

import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-top-right.svg'

import EthProfitIcon from 'assets/images/profit.png'

import styles from './styles.module.scss'
import { Button, Modal } from 'components/shared'
import { useNavigate } from 'react-router-dom'
import { humanReadableAddress } from 'utils/global'

interface ModalConfirmExitProps {
  open: boolean
  txLink: string
  blsKey: string
  onClose: () => void
}

export const ModalWithdrawSuccessful = ({
  open,
  txLink,
  blsKey,
  onClose
}: ModalConfirmExitProps) => {
  const navigate = useNavigate()
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <img src={EthProfitIcon} className="select-none" style={{ height: '64px' }} />
          <h3 className={styles.confirmPasswordHeader}>Success</h3>
          <div className="text-grey700 text-sm">
            You{"'"}ve successfully withdrawn your validator <br /> {humanReadableAddress(blsKey)}
          </div>
          <div className="w-full flex flex-col mt-2 items-center gap-4">
            <div className="flex gap-4">
              <Button onClick={() => navigate('/')}>Home</Button>
              <a
                href={txLink}
                target="_blank"
                rel="noreferrer"
                className="border border-border rounded-lg">
                <Button variant="text-primary">
                  <div className="flex items-center gap-2 text-grey300">
                    Etherscan <ArrowTopRightIcon />
                  </div>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
