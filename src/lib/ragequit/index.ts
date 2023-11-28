import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BEACON_NODE_URL } from 'constants/chains'
import { BalanceReportT, TStakehouseSDK } from 'types'
import { TEligibilityStatus } from 'types/ragequit'
import { notifyHash } from 'utils/global'

export const customErrors = {
  BLS_KEY_DEPOSITED: 'Error: Public key has made a deposit',
  INVALID_PAYLOAD: 'Error: Invalid payload data',
  INVALID_CHAIN: 'Error: Invalid beacon chain',
  NO_REPORT_SUPPLIED: 'Error: No beacon chain report supplied',
  NODE_VALIDATION_FAIL: 'Error: Failed to validate against multiple beacon nodes',
  INVALID_CREDENTIALS: 'Error: Invalid credentials',
  NO_DEPOSIT: 'Error: No ETH deposited',
  CORRUPTED_DEPOSIT_DATA: 'Error: Corrupted Deposit Data',
  CORRUPTED_KEYSTORE_DATA: 'Error: Corrupted Keystore Data',
  NO_DISASTER_RECOVERY: 'Error: No Disaster Recovery Submitted',
  NULL_OR_UNDEFINED_VALUE: 'Error: Null or Undefined Value Provided',
  STATUS_NOT_0: 'Error: Validator Status not 0. BLS Key already in use',
  STATUS_NOT_1:
    'Error: Validator Status not 1. Make sure BLS initials are registered and not already in use for deposit',
  STATUS_NOT_2:
    'Error: Validator Status not 2. Make sure deposit is complete and derivative tokens are not yet minted',
  STATUS_NOT_2_OR_3: 'Error: Validator Status not 2 or 3. Validator not active',
  NO_BALANCE_INCREASE: 'Error: Validator balance has not increased',
  ETH_BALANCE_LT_32: 'Error: Active Balance found to be less than 32 ETH',
  DETH_BALANCE_LT_24: 'Error: dETH Balance found to be less than 24',
  SLOT_BALANCE_LT_4: 'Error: SLOT Balance found to be less than 4',
  SETH_BALANCE_LT_12: 'Error: sETH Balance found to be less than 12',
  COLLATERALIZED_SETH_BALANCE_LT_THRESHOLD:
    'Error: Collateralized sETH Balance found to be less than sETH Redemption Threshold',
  COLLATERALIZED_KNOTS_NOT_ALLOWED: 'Error: Too Many Collateralized Owners.'
}

export async function checkRageQuitEligibility(
  sdk: TStakehouseSDK,
  validatorAddress: string,
  stakehouseAddress: string,
  userAddress: string
): Promise<TEligibilityStatus> {
  const fetchBalanceReport = async () => {
    try {
      const report = await getBalanceReport(sdk, validatorAddress)
      return report
    } catch (err) {
      return 'error'
    }
  }

  try {
    const balanceReport = await fetchBalanceReport()

    if (balanceReport === 'error') return TEligibilityStatus.Error

    const result: boolean = await sdk.utils.rageQuitChecks(
      stakehouseAddress,
      userAddress,
      balanceReport
    )
    if (result) return TEligibilityStatus.Eligible

    return TEligibilityStatus.Ineligible
  } catch (e) {
    console.error(e)
    if (e === customErrors.SETH_BALANCE_LT_12) {
      return TEligibilityStatus.IneligibleSETH
    }

    if (e === customErrors.DETH_BALANCE_LT_24) {
      return TEligibilityStatus.IneligibleDETH
    }

    return TEligibilityStatus.Ineligible
  }
}

export async function getBalanceReport(sdk: TStakehouseSDK, validatorAddress: string) {
  const failedNodesErrorRegex = /Failed to validate against multiple beacon nodes/gi
  try {
    const epochReport = await sdk.balanceReport.getFinalisedEpochReport(
      BEACON_NODE_URL,
      validatorAddress
    )
    const balanceReport: BalanceReportT = await sdk.balanceReport.authenticateReport(
      BEACON_NODE_URL,
      epochReport
    )

    const reportResult = JSON.parse(JSON.stringify(balanceReport))
    const isError = reportResult?.error || reportResult?.name?.toLowerCase() === 'error'
    if (isError) return 'error'

    return balanceReport
  } catch (e) {
    console.error(`Error getting balance report: ${e}`)
    return 'error'
  }
}

export async function getExitFee(sdk: TStakehouseSDK, report: any) {
  try {
    const exitFee: number = await sdk.utils.calculateExitFeeBeforeWithdrawalEpoch(report)
    return exitFee
  } catch (e) {
    console.error(`Error getting exit fee: ${e}`)
  }
}

export async function performRageQuit(
  sdk: TStakehouseSDK,
  stakehouseAddress: string,
  balanceReport: BalanceReportT,
  address: string,
  topUpAmountInWei: number
) {
  try {
    const response: TransactionResponse = await sdk.rageQuitKnot(
      stakehouseAddress,
      balanceReport,
      address,
      topUpAmountInWei
    )
    notifyHash(response.hash)
    const receipt = await response.wait(1)
    return receipt
  } catch (e) {
    console.error(`Error performing Rage Quit: ${e}`)
    if (e instanceof Error && e.message.includes('denied transaction signature')) {
      return 'rejected'
    }
    return 'error'
  }
}

export const checkNonZeroDETHBalance = async (sdk: TStakehouseSDK, blsPublicKey: string) => {
  try {
    const result = await sdk.utils.getDETHBalanceInIndex(blsPublicKey)
    return result
  } catch (err) {
    console.error('error: ', err)
    return null
  }
}
