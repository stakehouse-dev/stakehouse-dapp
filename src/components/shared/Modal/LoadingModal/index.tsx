import { FC } from 'react'
import { ModalDialogProps, ModalDialog } from '../ModalDialog'
import { LoadingModalViewProps, LoadingModalView } from '../LoadingModalView'

export type LoadingModalProps = LoadingModalViewProps & Omit<ModalDialogProps, 'children'>

export const LoadingModal: FC<LoadingModalProps> = (props) => {
  return (
    <ModalDialog {...props}>
      <LoadingModalView {...props} />
    </ModalDialog>
  )
}
