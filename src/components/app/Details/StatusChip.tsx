import { FC } from 'react'

import './styles.scss'

const StatusChip: FC<{
  status: 'PENDING' | 'MINTED' | 'MINTABLE' | 'WITHDRAWN' | 'RAGE QUIT' | 'INDEXED' | 'UNSTAKED'
}> = ({ status }) => {
  if (status === 'MINTABLE') {
    return (
      <div className="chip--mintable">
        <div className="dot" />
        Minting Available
      </div>
    )
  }

  if (status === 'UNSTAKED') {
    return <div className="chip--mintable">Unstaked</div>
  }

  if (status === 'MINTED') {
    return (
      <div className="chip--mintable">
        <div className="dot" />
        Ready to Withdraw
      </div>
    )
  }

  if (status === 'WITHDRAWN') {
    return (
      <div className="chip--withdraw">
        <div className="dot" />
        dETH Withdrawn
      </div>
    )
  }

  if (status === 'RAGE QUIT') {
    return (
      <div className="chip--ragequit">
        <div className="dot" />
        Rage Quit
      </div>
    )
  }

  if (status === 'INDEXED') {
    return (
      <div className="chip">
        <div className="dot" />
        Indexed
      </div>
    )
  }

  return (
    <div className="chip">
      <div className="dot" />
      Pending
    </div>
  )
}

export default StatusChip
