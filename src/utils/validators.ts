import { config } from 'constants/environment'
import { ValidatorT, ValidatorLifecycleStatuses } from 'types'

export function isValidatorDETHWithdrawable(
  validator: ValidatorT,
  knotData: any,
  fromIndex = false,
  indexedOnly = false
): boolean {
  const newIndexId = knotData?.savETHIndexes?.length ? knotData.savETHIndexes[0].id : 0

  if (!isValidatorDerivativesMinted(validator)) return false
  if (!validator.knotMetadata?.isPartOfIndex) return false

  if (fromIndex && newIndexId === validator.knotMetadata?.savETHIndexId) return false

  if (indexedOnly && newIndexId !== validator.knotMetadata?.savETHIndexId) return false

  return (
    validator.knotMetadata?.savETHIndexId !== knotData.id &&
    !!Number(validator.knotMetadata?.savETHIndexId)
  )
}

export function isValidatorDerivativesMinted(validator: ValidatorT | null | undefined): boolean {
  return (
    !!validator?.stakeHouseMetadata &&
    validator.lifecycleStatus === ValidatorLifecycleStatuses.derivativesMinted
  )
}

export function isRageQuitted(validator: ValidatorT | null | undefined): boolean {
  return validator?.lifecycleStatus === ValidatorLifecycleStatuses.exited
}

export function isUnstaked(validator: ValidatorT | null | undefined): boolean {
  return validator?.lifecycleStatus === ValidatorLifecycleStatuses.unstaked
}

export const handleAddTokenToWallet = async () => {
  const { ethereum } = window as any

  try {
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: config.dethTokenAddress,
          symbol: 'dETH',
          decimals: 18
        }
      }
    })
  } catch (err) {
    console.log('error: ', err)
  }
}
