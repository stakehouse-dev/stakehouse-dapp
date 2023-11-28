import { JoinStakehouseContent, MintingHeader } from 'components/app'
import { useState } from 'react'
import styles from './styles.module.scss'

const JoinStakehouse = () => {
  const [minted, setMinted] = useState(false)

  return (
    <div className={styles.joinstakehouse}>
      <div className={styles.joinstakehouseContainer}>
        <MintingHeader minted={minted} />
        <JoinStakehouseContent minted={minted} setMinted={setMinted} />
      </div>
    </div>
  )
}

export default JoinStakehouse
