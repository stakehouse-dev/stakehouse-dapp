import { FC, useContext, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'

import { Dropzone } from 'components/shared'
import { ModalApproveKeyUploading } from 'components/app'

import { useFlaggedWallet } from 'hooks/useFlaggedWallet'
import { BlockswapSDKContext } from 'context/BlockswapSDKContext'
import { DepositObjectT } from 'types'
import { notifyHash, noty } from 'utils/global'

import { ReactComponent as CheckIcon } from 'assets/images/icon-check-grey.svg'
import { ReactComponent as TrashIcon } from 'assets/images/icon-trash.svg'
import styles from './styles.module.scss'
import TransactionRejectedModal from 'components/app/Modals/TransactionRejectedModal'

interface IProps {
  onRegisterDepositObject: (obj: DepositObjectT | null) => void
  depositObject: DepositObjectT | undefined
}

const DepositSection: FC<IProps> = ({ onRegisterDepositObject, depositObject }) => {
  const isFlagged = useFlaggedWallet()
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false)
  const { address: account } = useAccount()
  const { sdk } = useContext(BlockswapSDKContext)

  const [file, setFile] = useState<File | null>(null)
  const [uploading, toggleUploading] = useState(false)
  const [depositError, setError] = useState('')

  const handleUploadDepositObject = async (file: File, onClear: () => void) => {
    // checking if address is flagged
    const flagged = await isFlagged()
    if (flagged) {
      toggleUploading(false)
      setOpenModal(true)
      return
    }

    onClear()
    setFile(file)
    toggleUploading(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleRegisterDepositObject = async () => {
    if (file && sdk) {
      try {
        const text = await file.text()
        const depositObject = JSON.parse(text) as DepositObjectT

        const [deposit] = depositObject
        const tx = await sdk.registerValidatorInitials(
          account,
          sdk.utils.add0x(deposit.pubkey),
          sdk.utils.add0x(deposit.signature)
        )
        notifyHash(tx.hash)
        await tx.wait()
        onRegisterDepositObject(depositObject)
        toggleUploading(false)
      } catch (err: unknown) {
        console.log('error: ', err, (err as any).message)
        // @ts-expect-error
        if (/already in use/gi.test(err)) {
          noty(
            'This deposit object has already been registered. Please re-generate your credentials and try again.'
          )
          setTimeout(() => {
            navigate('../download-cli')
          }, 2000)
        } else {
          setError('Something went wrong with uploading your file. Please try again.')
        }
      }
    }
  }
  const handleResetFile = () => {
    setFile(null)
    onRegisterDepositObject(null)
  }
  const handleCloseApproveModal = () => {
    toggleUploading(false)
    setError('')
  }

  if (depositObject && file && !uploading) {
    return (
      <div className={styles.deposit}>
        <div className={styles.depositFileInfo}>
          <span className={styles.depositFileName}>{file?.name}</span>
          <span className={styles.depositFileSize}>{file?.size} B</span>
        </div>
        <div className="flex items-center">
          <span className={styles.depositFileName}>Done</span>
          <CheckIcon />
          <div className={styles.depositIconBtn}>
            <TrashIcon onClick={handleResetFile} />
          </div>
        </div>
        <TransactionRejectedModal open={openModal} onClose={handleCloseModal} />
      </div>
    )
  }

  return (
    <>
      <Dropzone onChange={handleUploadDepositObject} size="sm">
        Drag and drop your <strong>deposit_data.json</strong> file here
      </Dropzone>
      <ModalApproveKeyUploading
        open={uploading}
        onApprove={handleRegisterDepositObject}
        onClose={handleCloseApproveModal}
        depositError={depositError}
      />
      <TransactionRejectedModal open={openModal} onClose={handleCloseModal} />
    </>
  )
}

export default DepositSection
