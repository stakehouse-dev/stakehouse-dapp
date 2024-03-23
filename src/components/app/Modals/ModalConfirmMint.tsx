import { FC, useContext, useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { useAccount } from 'wagmi'
import classNames from 'classnames'

import { Button, Modal, Tooltip } from 'components/shared'

import { BlockswapSDKContext } from 'context/BlockswapSDKContext'
import { handleErr, notifyHash } from 'utils/global'

import { ReactComponent as DollarGreenIcon } from 'assets/images/icon-dollar-green.svg'
import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import styles from './styles.module.scss'

interface IProps {
  open: boolean
  blsPublicKey: string | undefined
  selectedTicker: any
  from?: 'JOIN' | 'CREATE'
  signature: any
  onClose: () => void
  onMint: (hash: string) => void
}

const cx = classNames.bind(styles)

const ModalConfirmMint: FC<IProps> = ({
  open,
  blsPublicKey,
  selectedTicker,
  from = 'JOIN',
  signature,
  onClose,
  onMint
}) => {
  const { sdk } = useContext(BlockswapSDKContext)
  const account = useAccount()

  const [confirmed, setConfirmed] = useState(false)
  const [pending, setPending] = useState(false)
  const [knotData, setKnotData] = useState<any[]>([])

  useEffect(() => {
    const fetchKnotData = async () => {
      if (sdk && account) {
        const knotData = await sdk.wizard.getCumulativeValidatorIndexes(
          account?.address?.toLowerCase() || ''
        )
        setKnotData(knotData)
      }
    }
    fetchKnotData()
  }, [sdk, account])

  const handleSubmit = async () => {
    if (!confirmed || pending || !sdk) return

    const knotIndex = knotData.length > 0 ? knotData[0].id : 0

    setPending(true)
    try {
      let result
      if (from === 'JOIN') {
        result = await sdk.joinStakehouse(
          account.address,
          selectedTicker.id,
          selectedTicker.brandId,
          knotIndex,
          signature
        )
      } else {
        result = await sdk.createStakehouse(account.address, selectedTicker, knotIndex, signature)
      }
      notifyHash(result.hash)
      await result.wait()
      onMint(result.hash)
    } catch (err: any) {
      handleErr(err)
    }
    setPending(false)
  }

  const handleClose = () => {
    setConfirmed(false)
    setPending(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={handleClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.toggleMode}>
          <DollarGreenIcon />
          <p className={styles.modalTitle}>Mint your tokens</p>
          <p className={styles.toggleModeDesc}>{blsPublicKey}</p>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-white">Confirm Validator Key</p>
              <Tooltip message="Please confirm this is the validator key located in your deposit_data.json file." />
            </div>
            <Button
              disabled={confirmed}
              className={confirmed ? 'text-primary300' : ''}
              onClick={() => setConfirmed(true)}>
              {confirmed ? 'Done' : 'Confirm'}
            </Button>
          </div>
          <Button disabled={!confirmed || pending} className="w-full h-12" onClick={handleSubmit}>
            {pending ? 'Minting...' : 'Mint Tokens'}
          </Button>
          <p className={styles.toggleModeDesc} style={{ wordBreak: 'normal' }}>
            {from === 'JOIN'
              ? 'This will mint 24 dETH and 8 SLOT tokens. You will hold 4 SLOT tokens in your Stakehouse Vault to maintain validator ownership. These tokens belong to you and are redeemable. '
              : 'This will mint 24 dETH and 8 SLOT tokens. You will hold 4 SLOT tokens in your Stakehouse Vault to maintain validator ownership. These tokens belong to you and are redeemable. '}
            <a
              href="https://docs.joinstakehouse.com/protocol/learn/slottokens"
              target={'_blank'}
              className="underline"
              rel={'noreferrer noopener'}>
              Read more
            </a>
            .
          </p>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalConfirmMint
