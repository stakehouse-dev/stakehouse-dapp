import { FC, useMemo, useState, useEffect, useCallback } from 'react'
import { useSDK } from 'hooks'

import { ReactComponent as DETHIcon } from 'assets/images/icon-deth.svg'
import { ReactComponent as SETHIcon } from 'assets/images/icon-seth.svg'
import { ReactComponent as SAVETHIcon } from 'assets/images/icon-saveth.svg'
import { ReactComponent as SLOTIcon } from 'assets/images/icon-slot.svg'
import { ReactComponent as CheckGreyIcon } from 'assets/images/icon-check-grey.svg'
import { ReactComponent as ArrowTopRightIcon } from 'assets/images/icon-arrow-up-right.svg'
import { ValidatorT } from 'types'
import { humanReadableAddress, weiToEthNum } from 'utils/global'
import { BigNumber, ethers } from 'ethers'
import { ClipboardCopy } from 'components/shared'
import { useNetworkBasedLinkFactories } from 'hooks'

interface IProps {
  validator: ValidatorT | undefined | null
  status: 'PENDING' | 'MINTABLE' | 'INDEXED' | 'MINTED' | 'WITHDRAWN' | 'RAGE QUIT' | 'UNSTAKED'
}

const DetailsBody: FC<IProps> = ({ validator, status }) => {
  const { sdk } = useSDK()
  const [redemption, setRedemption] = useState<string>('--')
  const [payoff, setPayoff] = useState<string>()
  const [dETHToSavETH, setDETHToSavETH] = useState<any>()
  const [sETH, setSETH] = useState('')

  const data = useMemo(() => {
    if (validator) {
      return {
        dETH: weiToEthNum(BigNumber.from(validator.totalDETHMinted)).toLocaleString(undefined, {
          maximumFractionDigits: 4
        }),
        sETH: weiToEthNum(BigNumber.from(validator.sETHMinted)).toLocaleString(undefined, {
          maximumFractionDigits: 4
        }),
        slot: Math.floor(weiToEthNum(BigNumber.from(validator.totalSLOT)) * 10000) / 10000.0
      }
    }

    return {
      dETH: '--',
      sETH: '--',
      slot: '--'
    }
  }, [validator])

  const loadCipStatus = useCallback(async () => {
    if (!sdk || !validator) return

    try {
      const response = await sdk.cip.getDecryptionState(validator.id)
    } catch (e) {
      console.error(e)
    }
  }, [validator, sdk])

  const loadSdkValues = useCallback(async () => {
    if (!sdk || !validator) return

    try {
      if (validator.stakeHouseMetadata) {
        const redemptionRate = await sdk.utils.getStakehouseRedemptionRate(
          validator.stakeHouseMetadata?.id
        )
        setRedemption(
          weiToEthNum(redemptionRate).toLocaleString(undefined, { maximumFractionDigits: 4 })
        )
        const exRate = await sdk.utils.getStakehouseExchangeRate(validator.stakeHouseMetadata?.id)
        const payoff = weiToEthNum(exRate) / weiToEthNum(redemptionRate)
        setPayoff(payoff.toLocaleString(undefined, { maximumFractionDigits: 4 }))
        const dETHToSavETH = await sdk.utils.dETHToSavETH(validator.totalDETHMinted)
        setDETHToSavETH(
          weiToEthNum(dETHToSavETH).toLocaleString(undefined, { maximumFractionDigits: 4 })
        )
        const slotRegistry = (await sdk.contractInstance).slotSettlementRegistry()
        const exchangeRate = await slotRegistry.exchangeRate(validator.stakeHouseMetadata.id)
        const SLASHING_COLLATERAL = await slotRegistry.SLASHING_COLLATERAL()
        const EXCHANGE_RATE_SCALE = await slotRegistry.EXCHANGE_RATE_SCALE()
        const activesETHBalance = exchangeRate.mul(SLASHING_COLLATERAL).div(EXCHANGE_RATE_SCALE)
        setSETH(
          Number(ethers.utils.formatEther(activesETHBalance)).toLocaleString(undefined, {
            maximumFractionDigits: 4
          })
        )
      }
    } catch (e) {
      console.log('fetch sdk values: ', e)
    }
  }, [validator, sdk])

  useEffect(() => {
    if (validator) {
      loadCipStatus()
      loadSdkValues()
    }
  }, [loadCipStatus])

  return (
    <div className="details-body">
      <div className="details-body--left">
        <div className="details-body__title">KNOT Stats</div>
        <div className="details-body__card">
          <div className="details-body__card__row">
            <div className="field__name">
              <DETHIcon />
              dETH
            </div>
            <p className="field__value">{data.dETH}</p>
          </div>
          <div className="details-body__card__row">
            <div className="field__name">
              <SAVETHIcon />
              savETH
            </div>
            <p className="field__value">{dETHToSavETH}</p>
          </div>
          <div className="details-body__card__row">
            <div className="field__name">
              <SETHIcon />
              sETH
            </div>
            <p className="field__value">{sETH}</p>
          </div>
          <div className="details-body__card__row">
            <div className="field__name">
              <SLOTIcon />
              SLOT
            </div>
            <p className="field__value">{data.slot}</p>
          </div>
        </div>
        <div className="details-body__title" style={{ marginBottom: 12 }}>
          Payoff Rate
        </div>
        <div className="details-body__label">{payoff}</div>
      </div>
      <div className="details-body--right">
        <div className="details-body__title">Details</div>
        <p className="details-body__label">
          <CheckGreyIcon /> Stakehouse:{' '}
          <span>{validator?.stakeHouseMetadata?.sETHTicker || '--'}</span>
        </p>
        <p className="details-body__label">
          <CheckGreyIcon /> Address:{' '}
          <ClipboardCopy copyText={validator?.id || ''}>
            {humanReadableAddress(validator?.id || '')}
          </ClipboardCopy>
        </p>
        <p className="details-body__label">
          <CheckGreyIcon /> Status:{' '}
          <span>
            {status === 'MINTABLE' && 'Minting Available'}
            {status === 'MINTED' && 'Ready to Withdraw'}
            {status === 'PENDING' && 'Pending'}
            {status === 'RAGE QUIT' && 'Rage quit'}
            {status === 'WITHDRAWN' && 'dETH Withdrawn'}
            {status === 'INDEXED' && 'Indexed'}
            {status === 'UNSTAKED' && 'Unstaked'}
          </span>
        </p>
        <p className="details-body__label">
          <CheckGreyIcon /> Execution Layer: <EtherscanLink hash={validator?.depositTxHash || ''} />
        </p>
        <p className="details-body__label">
          <CheckGreyIcon /> Consensus Layer: <BeaconChainLink id={validator?.id || ''} />
        </p>
        <p className="details-body__label">
          <CheckGreyIcon /> Redemption Rate: <span>{redemption}</span>
        </p>
      </div>
    </div>
  )
}

const EtherscanLink: FC<{ hash: string }> = ({ hash }) => {
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  return (
    <a href={makeEtherscanLink(hash)} target={'_blank'} rel={'noopener noreferrer'}>
      <ArrowTopRightIcon />
    </a>
  )
}

const BeaconChainLink: FC<{ id: string }> = ({ id }) => {
  const { makeBeaconLink } = useNetworkBasedLinkFactories()

  return (
    <a href={makeBeaconLink(id)} target={'_blank'} rel={'noopener noreferrer'}>
      <ArrowTopRightIcon />
    </a>
  )
}

export default DetailsBody
