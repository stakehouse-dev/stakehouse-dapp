import { FC } from 'react'
import { ModalDialogProps, ModalDialog } from '../ModalDialog'
import { ErrorModalViewProps, ErrorModalView } from '../ErrorModalView'

export type ErrorModalProps = ErrorModalViewProps & Omit<ModalDialogProps, 'children'>

export const ErrorModal: FC<ErrorModalProps> = (props) => {
  return (
    <ModalDialog {...props}>
      <ErrorModalView {...props} />
    </ModalDialog>
  )
}
