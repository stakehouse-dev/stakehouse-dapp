import { FC } from 'react'
import { Spinner, Tooltip } from 'components/shared'

import './styles.scss'
import { useNetworkBasedLinkFactories } from 'hooks'

interface IProps {
  data: any[]
  isLoading: boolean
}

const Description: FC<{ activity: any; blsKeyToTxHashes: any }> = ({
  activity,
  blsKeyToTxHashes
}) => {
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  switch (activity.key) {
    case 'NEW_STAKEHOUSE_REGISTRY_DEPLOYED':
      return (
        <span className="description">
          You have created a Stakehouse{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'NEW_HOUSE_MEMBER':
      return (
        <span className="description">
          Mint dETH and SLOT tokens{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'RAGE_QUIT':
      return (
        <span className="description">
          Rage quit knot{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'DETH_REWARDS_MINTED':
      return (
        <span className="description">
          dETH Balance Reported{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'SLOT_SLASHED':
      return (
        <span className="description">
          KNOT Slashed{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'DETH_WITHDRAWN_INTO_OPEN_MARKET':
      return (
        <span className="description">
          Withdraw dETH{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'KNOT_INSERTED_INTO_INDEX':
      return (
        <span className="description">
          dETH added to my savETH{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'INITIALS_REGISTERED':
      return (
        <span className="description">
          Register Deposit Data file{' '}
          <a
            href={makeEtherscanLink(
              blsKeyToTxHashes[activity.blsPubKeyForKnot]['INITIALS_REGISTERED']
            )}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>{' '}
          {blsKeyToTxHashes[activity.blsPubKeyForKnot]['DEPOSIT_REGISTERED'] && (
            <span>
              Register Keystore file{' '}
              <a
                href={makeEtherscanLink(
                  blsKeyToTxHashes[activity.blsPubKeyForKnot]['DEPOSIT_REGISTERED']
                )}
                target="_blank"
                rel="noreferrer"
                className={'text-green'}>
                (check TX here)
              </a>
            </span>
          )}
        </span>
      )
    case 'SIGNING_KEY_RE_ENCRYPTION':
      return (
        <span className="description">
          Signing Key re-encrypted{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-green'}>
            (check TX here)
          </a>
        </span>
      )
    case 'ETH_DEPOSITED_BY_STAKER':
      return (
        <span className="description">
          Deposited ETH{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'LP_BURNED_FOR_ETH':
      return (
        <span className="description">
          Burned Giant LP Token for ETHs{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'GIANT_LP_SWAPPED':
      return (
        <span className="description">
          Swapped Giant LP Token for LSD Pool Token{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'SMART_WALLET_CREATED':
      return (
        <span className="description">
          Created a smart wallet{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'NEW_VALIDATOR_REGISTERED':
      return (
        <span className="description">
          Registered a new validator{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'LP_TOKEN_ISSUED':
      return (
        <span className="description">
          Minted new LP Token{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'LP_TOKEN_MINTED':
      return (
        <span className="description">
          Minted LP Token{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'KNOT_STAKED':
      return (
        <span className="description">
          Staked a new KNOT{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'STAKEHOUSE_CREATED':
      return (
        <span className="description">
          Created a new Stakehouse{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'STAKEHOUSE_JOINED':
      return (
        <span className="description">
          Joined a Stakehouse{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'DETH_CLAIMED':
      return (
        <span className="description">
          Claimed dETH{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'FEES_AND_MEV_CLAIMED':
      return (
        <span className="description">
          Claimed Fees and MEV rewards{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'NODE_RUNNER_REWARDS_CLAIMED':
      return (
        <span className="description">
          Claimed node operator rewards{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'SLOT_TOPPED_UP':
      return (
        <span className="description">
          Topped up SLOT{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'VALIDATOR_UNSTAKED':
      return (
        <span className="description">
          Validator Unstaked{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'RAGE_QUIT_ASSISTANT_DEPLOYED':
      return (
        <span className="description">
          Rage Quit Assistant Deployed{' '}
          <a
            href={makeEtherscanLink(activity.id.slice(0, 66))}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'RAGE_QUIT_LP_MINTED':
      return (
        <span className="description">
          Rage Quit LP Minted{' '}
          <a
            href={makeEtherscanLink(activity.id.slice(0, 66))}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'RAGE_QUIT_LP_BURNED':
      return (
        <span className="description">
          Rage Quit LP Burned{' '}
          <a
            href={makeEtherscanLink(activity.id.slice(0, 66))}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case 'NODE_OPERATOR_CLAIMED_UNSTAKED_ETH':
      return (
        <span className="description">
          Node Operator Claimed Unstaked ETH{' '}
          <a
            href={makeEtherscanLink(activity.id)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    default:
      return <></>
  }
}

const TableActivity: FC<IProps> = ({ data, isLoading }) => {
  const blsKeyToTxHashes: any = {}

  const filteredEvents = data
    .map((event: any) => {
      if (!blsKeyToTxHashes[event.blsPubKeyForKnot]) {
        blsKeyToTxHashes[event.blsPubKeyForKnot] = {}
      }

      if (event.key === 'INITIALS_REGISTERED') {
        blsKeyToTxHashes[event.blsPubKeyForKnot]['INITIALS_REGISTERED'] = event.id
      } else if (event.key === 'DEPOSIT_REGISTERED') {
        blsKeyToTxHashes[event.blsPubKeyForKnot]['DEPOSIT_REGISTERED'] = event.id
      }

      return event
    })
    .filter((event: any) => event.key !== 'DEPOSIT_REGISTERED')

  return (
    <div className="validator">
      <table className="table table--activity">
        <thead>
          <tr>
            <th>
              <div className="flex items-center gap-1">
                Block <Tooltip message="Block where the transaction took place." />
              </div>
            </th>
            <th>
              <div className="flex items-center gap-1">
                Description <Tooltip message="Description of the transaction." />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            filteredEvents.length > 0 &&
            filteredEvents.map((activity, idx) => (
              <tr key={idx}>
                <td>{activity.blockNumber}</td>
                <td>
                  <Description activity={activity} blsKeyToTxHashes={blsKeyToTxHashes} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {isLoading && (
        <div className="table__loading">
          <Spinner size={30} />
        </div>
      )}
      {!isLoading && data.length === 0 && <div className="table__empty">No activity found</div>}
    </div>
  )
}

export default TableActivity
