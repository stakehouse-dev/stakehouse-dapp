import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ArrowLeftSVG from 'assets/images/arrow-left.svg'
import {
  Button,
  ClipboardCopy,
  Dropzone,
  ErrorModal,
  LoadingModal,
  TextInput,
  Tooltip
} from 'components/shared'

import { useSDK } from 'hooks'
import { KeystoreT } from 'types'
import { handleErr, humanReadableAddress, parseFileAsJson } from 'utils/global'
import { ModalExitValidatorSuccess, Stepper } from 'components/app'
import { BEACON_NODE_URL } from 'constants/chains'

interface PasswordValidationT {
  required?: string | undefined
  length?: string | undefined
}

const ExitValidator = () => {
  const navigate = useNavigate()
  const { blsKey } = useParams()
  const { sdk } = useSDK()

  const [error, setError] = useState('')
  const [keystoreFile, setKeystoreFile] = useState<File>()
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [passwordValidationErr, setPasswordValidationErr] = useState<PasswordValidationT>()

  const [isExitSuccessModal, setIsExitSuccessModal] = useState<boolean>(false)

  const handleUploadFile = async (file: File) => {
    const keystore = await parseFileAsJson<KeystoreT>(file)
    if (`0x${keystore.pubkey}` !== blsKey) {
      return setError('Please make sure to upload correct keystore file.')
    }
    setKeystoreFile(file)
  }

  const handleCloseErrorModal = () => {
    setError('')
  }

  useEffect(() => {
    if (!confirmPassword) {
      return setPasswordValidationErr({ required: 'Password is required' })
    } else if (confirmPassword.length < 8) {
      return setPasswordValidationErr({ length: 'Your password must be 8 or more characters.' })
    } else {
      setPasswordValidationErr(undefined)
    }
  }, [confirmPassword])

  const handleConfirm = async () => {
    if (!sdk || !keystoreFile) return

    setConfirming(true)
    let ragequit
    try {
      const stringValue = localStorage.getItem('ragequit')

      if (stringValue) {
        ragequit = JSON.parse(stringValue)
        if (ragequit.includes(blsKey)) {
          setConfirming(false)
          navigate('status')
          return
        }
      }

      const keystore = await parseFileAsJson<KeystoreT>(keystoreFile)

      await sdk.withdrawal.broadcastVoluntaryWithdrawal(BEACON_NODE_URL, keystore, confirmPassword)

      if (ragequit) {
        ragequit = [...ragequit, blsKey]
      } else {
        ragequit = [blsKey]
      }
      localStorage.setItem('ragequit', JSON.stringify(ragequit))
      setConfirming(false)
    } catch (err) {
      console.log(err)
      setConfirming(false)
      const errMsg = handleErr(err, 'Please ensure the password and validator file are correct.')

      if (errMsg === 'Could not perform this action.') {
        setTimeout(
          () =>
            setError(
              'The validator is too new to exit. It has to be active for at least 256 epochs'
            ),
          500
        )
      } else
        setTimeout(
          () =>
            setError(handleErr(err, 'Please ensure the password and validator file are correct.')),
          500
        )
      return
    }
    setIsExitSuccessModal(true)
  }

  return (
    <div className="w-full flex-1">
      <div className="max-w-3xl w-full mx-auto mt-20 rounded-2xl bg-grey850">
        <div className="font-semibold flex gap-5 items-center text-white relative text-2xl mb-10">
          <img src={ArrowLeftSVG} onClick={() => navigate(-1)} />
          <div className="flex-grow">Exit Validator</div>
          <Stepper step={1} />
        </div>
        <div className="rounded-2xl border border-innerBorder py-8 flex justify-center">
          <div
            className="flex flex-col rounded-lg bg-grey900 w-full px-10 py-4"
            style={{ maxWidth: '627px' }}>
            <div className="flex gap-6 text-primary pb-4 pt-2 items-center">
              <div className="border rounded-full border-primary w-8 h-8 flex items-center justify-center text-xs">
                1
              </div>
              <div className="flex gap-2">
                <p className="font-medium "> Confirm your keystore file </p>
                <Tooltip message="Confirming your keystore file is required for validator withdrawals." />
              </div>
            </div>
            <div className="overflow-hidden w-full border border-innerBorder rounded-lg mb-6">
              <table className="w-full table-auto border-collapse">
                <thead className="text-xs text-grey300">
                  <tr className="border-b border-innerBorder">
                    <th className="px-3 py-3 font-medium text-left">#</th>
                    <th className="px-3 fpy-3 font-medium text-left">BLS Key</th>
                    <th className="px-3 py-3 font-medium text-left">Keystore file</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 content-center h-14 text-white text-sm">1</td>
                    <td className="px-3 content-center h-14 text-white text-sm">
                      <ClipboardCopy copyText={blsKey || ''}>
                        {humanReadableAddress(blsKey || '', 15)}
                      </ClipboardCopy>
                    </td>
                    <td className="px-3 content-center h-14 text-white text-sm">
                      <Dropzone
                        uploadedFile={keystoreFile}
                        onChange={(file) => handleUploadFile(file)}
                        size="sm"
                        noStyle
                        onClear={() => setKeystoreFile(undefined)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-col w-full gap-2 mb-4">
              <TextInput
                label="Enter Keystore Password"
                type="password"
                className="py-2 px-3.5 rounded-lg border border-grey500 bg-black text-white text-base"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordValidationErr?.required && (
                <span className="text-error text-xs text-left">
                  {passwordValidationErr.required}
                </span>
              )}
              {passwordValidationErr?.length && (
                <span className="text-error text-xs text-left">{passwordValidationErr.length}</span>
              )}
            </div>
            <Button
              variant="primary"
              className="w-full h-12"
              disabled={!confirmPassword || confirming || !!passwordValidationErr || !keystoreFile}
              onClick={handleConfirm}>
              Confirm
            </Button>
            <LoadingModal open={confirming} title="Confirmation Pending" onClose={() => {}} />
          </div>
        </div>
      </div>
      <ErrorModal
        open={!!error}
        onClose={handleCloseErrorModal}
        title="Error"
        message={error}
        actionButtonContent={
          error == 'The validator is too new to exit. It has to be active for at least 256 epochs'
            ? 'Home'
            : 'Try Again'
        }
        onAction={
          error == 'The validator is too new to exit. It has to be active for at least 256 epochs'
            ? () => navigate('/')
            : handleCloseErrorModal
        }
      />
      <ModalExitValidatorSuccess
        open={isExitSuccessModal}
        onClose={() => setIsExitSuccessModal(false)}
      />
    </div>
  )
}
export default ExitValidator
