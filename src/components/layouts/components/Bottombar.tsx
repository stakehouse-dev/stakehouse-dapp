import { FC } from 'react'
import { useBlockNumber } from 'wagmi'

import '../styles.scss'

const Bottombar: FC = () => {
  const { data: currentBlock } = useBlockNumber()

  return (
    <div className="bottombar">
      <p className="bottombar__left"></p>
      <p className="bottombar__right">
        Block <span>{currentBlock}</span>
      </p>
    </div>
  )
}

export default Bottombar
