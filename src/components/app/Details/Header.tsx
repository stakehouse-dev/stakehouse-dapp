import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import StatusChip from './StatusChip'

import { ValidatorT } from 'types'

import { ReactComponent as ArrowLeftIcon } from 'assets/images/icon-arrow-left.svg'
import './styles.scss'

interface IProps {
  validator: ValidatorT | undefined | null
  status: 'PENDING' | 'MINTABLE' | 'INDEXED' | 'MINTED' | 'WITHDRAWN' | 'RAGE QUIT' | 'UNSTAKED'
}

const DetailsHeader: FC<IProps> = ({ validator, status }) => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="details-header">
      <div className="details-header__main">
        <button onClick={handleGoBack}>
          <ArrowLeftIcon />
        </button>
        <p className="details-header__name">{validator?.stakeHouseMetadata?.sETHTicker || '--'}</p>
        <StatusChip status={status} />
      </div>
    </div>
  )
}

export default DetailsHeader
