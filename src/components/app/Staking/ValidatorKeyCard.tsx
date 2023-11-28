import { Button } from 'components/shared'
import { FC } from 'react'
import { bytesForHuman } from 'utils/global'

import styles from './styles.module.scss'

interface IProps {
  onDownload: () => void
  blob: File | null
  downloaded: boolean
  name: string
  disabled?: boolean
}

const ValidatorKeyCard: FC<IProps> = ({ onDownload, blob, downloaded, name, disabled }) => {
  return (
    <div className={styles.validatorKeyCard}>
      <div>
        <div className="text-sm text-grey25 font-medium">{name}</div>
        <div className="text-sm text-grey300">{bytesForHuman(blob?.size || 0)}</div>
      </div>

      <Button variant="primary" disabled={disabled} onClick={onDownload}>
        Download
      </Button>
    </div>
  )
}

export default ValidatorKeyCard
