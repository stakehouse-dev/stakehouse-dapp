import { useContext, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { StakingLayout } from 'components/app'
import { Button, Tooltip } from 'components/shared'

import { StakingStoreContext } from 'context/StakingStoreContext'
import { STAKING_MODE } from 'types'
import { useNetworkBasedLinkFactories } from 'hooks'

import { ReactComponent as IConEths } from 'assets/images/icon-eth-bigs.svg'
import { ReactComponent as IconArrowUpRight } from 'assets/images/icon-arrow-up-right.svg'
import { ReactComponent as IconArrowUpRightGreen } from 'assets/images/icon-arrow-top-right-green.svg'
import styles from './styles.module.scss'

const SetupANode = () => {
  const navigate = useNavigate()
  const { makeEtherscanLink, makeBeaconLink } = useNetworkBasedLinkFactories()
  const { depositObject, txRegisterHash, mode, step } = useContext(StakingStoreContext)

  const beaconLink = useMemo(() => {
    if (depositObject) {
      return makeBeaconLink(depositObject[0].pubkey)
    }

    return ''
  }, [depositObject])

  useEffect(() => {
    if (mode === STAKING_MODE.EASY) {
      switch (step) {
        case 1:
          return navigate('/')
        case 2:
          return navigate('../validator-registration')
      }
    } else if (mode === STAKING_MODE.EXPOERT) {
      switch (step) {
        case 1:
          return navigate('../download-cli')
        case 2:
          return navigate('../expert-validator-registration')
      }
    }
  }, [step, mode])

  return (
    <StakingLayout currentStep={3} title="Set up a Node">
      <div className={styles.finalStep}>
        <IConEths width={64} height={64} />
        <div className={styles.setupNode}>
          <a
            href="https://ethereum.org/en/run-a-node/"
            target={'_blank'}
            rel={'noopener noreferrer'}>
            <Button variant="primary" className="w-72 h-12">
              <div className="flex items-center gap-2 justify-center text-base font-medium">
                Set up a Node
                <IconArrowUpRight stroke="black" />
              </div>
            </Button>
          </a>
          <div className={styles.tooltip}>
            <Tooltip message="To earn staking rewards and network revenue while avoiding penalties, running a node or finding a node operator is required." />
          </div>
        </div>
        <Link to="/">
          <Button variant="secondary" className="w-72 h-12">
            My Profile
          </Button>
        </Link>
        <div className={styles.horizontalBar} />
        <div className={styles.linkGroup}>
          <a href={makeEtherscanLink(txRegisterHash)} target={'_blank'} rel={'noopener noreferrer'}>
            <Button variant="secondary">Etherscan</Button>
          </a>
          <a href={beaconLink} target={'_blank'} rel={'noopener noreferrer'}>
            <Button variant="secondary">Beacon Chain Explorer</Button>
          </a>
        </div>
      </div>
      <a
        className="absolute left-1/2 -bottom-14"
        style={{ transform: 'translateX(-50%)' }}
        href="https://help.joinstakehouse.com/en/"
        target={'_blank'}
        rel={'noopener noreferrer'}>
        <div className="flex items-center gap-3 text-sm font-medium text-primary py-2 px-3.5 rounded-lg hover:bg-grey800">
          Learn More <IconArrowUpRightGreen />
        </div>
      </a>
    </StakingLayout>
  )
}

export default SetupANode
