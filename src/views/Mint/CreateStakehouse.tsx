import { useState } from 'react'

import { CreateStakehouseContent, MintingHeader } from 'components/app'

import styles from './styles.module.scss'

const CreateStakehouse = () => {
  const [minted, setMinted] = useState(false)

  return (
    <div className={styles.joinstakehouse}>
      <div className={styles.joinstakehouseContainer}>
        <MintingHeader minted={minted} />
        <CreateStakehouseContent minted={minted} setMinted={setMinted} />
      </div>
    </div>
  )
}

export default CreateStakehouse
