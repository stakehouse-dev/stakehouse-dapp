import { FC, ReactNode } from 'react'
import { ModalDialog, LoadingModalView, ErrorModalView, CompletedTxView } from 'components/shared'

export interface ModalRageQuitConfirmationProps {
  open: boolean
  onClose: () => void
  txLink?: string
  loading?: boolean
  error?: boolean
  errorMessage?: ReactNode
  onErrorAction?: () => void
}

const ModalRageQuitConfirmation: FC<ModalRageQuitConfirmationProps> = ({
  open,
  onClose,
  txLink,
  loading = false,
  error = false,
  errorMessage = '',
  onErrorAction = () => {}
}) => {
  return (
    <ModalDialog open={open} onClose={onClose}>
      {loading ? (
        <LoadingModalView title="Confirmation pending" />
      ) : error || errorMessage ? (
        <ErrorModalView
          title="Rage Quit Failed"
          message={errorMessage}
          actionButtonContent="Retry"
          onAction={onErrorAction}
        />
      ) : (
        <CompletedTxView title="Rage Quit Confirmed" txLink={txLink} goToLink="/" />
      )}
    </ModalDialog>
  )
}

export default ModalRageQuitConfirmation
