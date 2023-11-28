import { useState, useContext, FC } from 'react'

import { ModalKeystoreError, ModalKeystorePassword } from 'components/app'
import { Dropzone } from 'components/shared'

import { BlockswapSDKContext } from 'context/BlockswapSDKContext'
import { DepositObjectT, KeystoreT } from 'types'

import styles from './styles.module.scss'

interface IProps {
  onNextStep: (keystore: KeystoreT, blsAuthRes: any) => void
  depositObject?: DepositObjectT
  disabled?: boolean
}

const KeystoreSection: FC<IProps> = ({ onNextStep, depositObject, disabled }) => {
  const [openErrModal, setOpenErrorModal] = useState(false)
  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedKeyStore, setUploadedkeyStore] = useState<KeystoreT | null>(null)

  const handleUploadFile = async (file: File, onClear: () => void) => {
    onClear()
    setUploadedFile(file)
    const text = await file.text()
    const keystore = JSON.parse(text) as KeystoreT

    if (depositObject && keystore.pubkey === depositObject[0].pubkey) {
      setUploadedkeyStore(keystore)
      setOpenApproveModal(true)
    } else {
      setOpenErrorModal(true)
    }
  }

  const handleCloseModal = () => {
    setOpenErrorModal(false)
    handleUploadedFileClear()
  }
  const handleCloseApproveModal = () => {
    setOpenApproveModal(false)
    handleUploadedFileClear()
  }

  const handleUploadedFileClear = () => {
    setUploadedkeyStore(null)
    setUploadedFile(null)
  }

  return (
    <>
      <Dropzone
        uploadedFile={uploadedFile}
        onChange={handleUploadFile}
        disabled={disabled}
        size="sm"
        onClear={handleUploadedFileClear}>
        <div className={styles.textContent}>
          <div>
            Drag and drop your <strong>keystore.json</strong> file
          </div>
        </div>
      </Dropzone>
      <ModalKeystoreError open={openErrModal} onClose={handleCloseModal} />
      <ModalKeystorePassword
        open={openApproveModal}
        depositObject={depositObject}
        uploadedKeyStore={uploadedKeyStore}
        onClose={handleCloseApproveModal}
        onApprove={(payload: any) => onNextStep(uploadedKeyStore!, payload)}
      />
    </>
  )
}

export default KeystoreSection
