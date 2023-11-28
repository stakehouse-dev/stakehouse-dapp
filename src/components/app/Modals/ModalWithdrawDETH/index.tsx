import { FC, useEffect, useMemo, useState } from 'react'
import {
  ModalDialog,
  DefaultModalView,
  LoadingModalView,
  Button,
  Tooltip,
  CompletedTxView,
  ErrorModalView,
  Modal
} from 'components/shared'
import { ReactComponent as EthIcon } from 'assets/images/icon-eth.svg'
import { ReactComponent as DETHIcon } from 'assets/images/icon-deth.svg'
import { ReactComponent as SelectorIcon } from 'assets/images/icon-chevron-down.svg'
import { ReactComponent as CloseCircleIcon } from 'assets/images/close-circle.svg'
import { BigNumber } from 'ethers'
import { weiToEthNum, cutDecimals, notifyHash, noty, isTxRejectedByUser } from 'utils/global'
import { isValidatorDETHWithdrawable, handleAddTokenToWallet } from 'utils/validators'
import { useUser, useSDK, useNetworkBasedLinkFactories } from 'hooks'

import styles from './styles.module.scss'
import { KnotRewardsQuery } from 'graphql/queries/knot'
import { useQuery } from '@apollo/client'
import { BEACON_NODE_URL } from 'constants/chains'
import { report } from 'process'
import { formatEther } from 'ethers/lib/utils'

export interface ModalWithdrawDETHProps {
  open: boolean
  onClose: () => void
  withdrawValidatorId?: string
  fromIndex?: boolean
  indexedOnly?: boolean
}

export const ModalWithdrawDETH: FC<ModalWithdrawDETHProps> = ({
  open,
  onClose,
  withdrawValidatorId = '',
  fromIndex = false,
  indexedOnly = false
}) => {
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { isValidatorsDataLoading, validators, refetchUserData, knotsData, userAddress } = useUser()
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [withdrawResult, setWithdrawResult] = useState<{ hash: string } | null>(null)
  const [withdrawalError, setWithdrawalError] = useState('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isDETH, setIsDETH] = useState<boolean>(true)
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false)
  const [isReported, setIsReported] = useState<boolean>(false)

  const newIndexId = Number(knotsData?.length) ? knotsData[0].id : 0

  const withdrawEligibleValidators = validators.filter((v) =>
    isValidatorDETHWithdrawable(v, knotsData, fromIndex, indexedOnly)
  )
  const withdrawValidator = withdrawEligibleValidators.find(({ id }) => id === withdrawValidatorId)

  const { data: { knot } = {}, refetch: refetchETHBalance } = useQuery(KnotRewardsQuery, {
    variables: { blsKey: withdrawValidatorId },
    skip: !withdrawValidatorId
  })

  const totalETH = useMemo(() => knot && knot.totalDETHRewardsReceived, [knot])

  const totalWithdrawableDETH = useMemo(() => {
    return 24 + Number(formatEther(totalETH ?? 0))
  }, [totalETH])

  const withdrawTxLink = (() => {
    if (!withdrawResult) return ''
    return makeEtherscanLink(withdrawResult.hash)
  })()

  const reportBalance = async () => {
    setIsWithdrawLoading(true)
    try {
      const tx = await sdk?.reportBalance(
        BEACON_NODE_URL,
        withdrawValidatorId,
        withdrawValidator?.stakeHouseMetadata?.id,
        0,
        true
      )

      setIsReported(true)
      setIsSuccessful(true)
      setTimeout(() => setIsSuccessful(false), 3000)
    } catch (error) {
      console.log(error)
      if (Number(totalETH) > 0) {
        setIsReported(true)
        setIsSuccessful(true)
        setTimeout(() => setIsSuccessful(false), 3000)
      } else setWithdrawalError('Balance Report Error')
    }
    setIsWithdrawLoading(false)
  }

  async function handleWithdrawDETH() {
    if (!sdk) return

    try {
      setIsWithdrawLoading(true)

      let tx: any

      if (fromIndex) {
        tx = await sdk.batchTransferKnotsToSingleIndex(
          withdrawEligibleValidators.map((v) => v?.stakeHouseMetadata?.id),
          withdrawEligibleValidators.map((v) => v.id),
          newIndexId
        )
      } else if (withdrawValidator) {
        tx = await sdk.addKnotToOpenIndexAndWithdraw(
          withdrawValidator?.stakeHouseMetadata?.id,
          withdrawValidator.id,
          userAddress
        )
      } else {
        tx = await sdk.batchAddKnotToOpenIndexAndWithdraw(
          withdrawEligibleValidators.map((v) => v?.stakeHouseMetadata?.id),
          withdrawEligibleValidators.map((v) => v.id),
          userAddress
        )
      }

      notifyHash(tx.hash)
      await tx.wait(1)

      refetchUserData(tx, 1)
      setWithdrawalError('')
      setWithdrawResult(tx)
    } catch (err) {
      if (!isTxRejectedByUser(err)) {
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: dETH withdrawal failed'
        setWithdrawalError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsWithdrawLoading(false)
    }
  }

  function handleClose() {
    setWithdrawResult(null)
    setWithdrawalError('')
    onClose()
  }

  const handleWithdrawETH = async () => {
    try {
      setIsWithdrawLoading(true)

      const tx = await sdk?.withdrawal.batchUnwrapDETH([withdrawValidatorId], [totalETH])

      notifyHash(tx.hash)
      await tx.wait(1)

      setWithdrawalError('')
      setWithdrawResult(tx)
      refetchETHBalance()
    } catch (err) {
      if (!isTxRejectedByUser(err)) {
        console.log(err)
        const errorMessage =
          (err as any)?.error?.message || (err as any)?.message || 'Error: ETH withdrawal failed'
        setWithdrawalError(errorMessage)
        noty(errorMessage)
      }
    } finally {
      setIsWithdrawLoading(false)
    }
  }

  return (
    <>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-2 transition-all rounded-2xl bg-black p-8 w-full max-w-md transform relative text-white">
          <div className="font-bold border-b border-border pb-2 text-left">Select A Token</div>
          <CloseCircleIcon
            className="absolute cursor-pointer top-4 right-4 hover:opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setIsDETH(true)
              setIsOpen(false)
            }}>
            <DETHIcon />
            <div className="flex flex-col items-start flex-grow">
              <span>dETH</span>
              <span className="text-xs text-grey600">Stakehouse Derivative ETH</span>
            </div>
            <div>{totalWithdrawableDETH}</div>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setIsDETH(false)
              setIsOpen(false)
            }}>
            <EthIcon />
            <div className="flex flex-col items-start flex-grow">
              <span>ETH</span>
              <span className="text-xs text-grey600">ETH Available</span>
            </div>
            <div>{formatEther(totalETH ?? 0)}</div>
          </div>
        </div>
      </Modal>
      <ModalDialog open={open && !isOpen} onClose={handleClose}>
        {isWithdrawLoading ? (
          <LoadingModalView title="Confirmation Pending" />
        ) : withdrawalError ? (
          <ErrorModalView
            title={`Failed to withdraw ${isDETH ? 'dETH' : 'ETH'}`}
            message={withdrawalError}
            actionButtonContent="Retry"
            onAction={isDETH ? handleWithdrawDETH : isReported ? handleWithdrawETH : reportBalance}
          />
        ) : withdrawResult ? (
          <CompletedTxView
            message={
              isDETH ? (
                <a
                  href="#"
                  className="border-b border-border cursor-pointer hover:opacity-75"
                  onClick={handleAddTokenToWallet}>
                  Add dETH to MetaMask token list
                </a>
              ) : (
                <></>
              )
            }
            txLink={withdrawTxLink}
            onGoToClick={handleClose}
          />
        ) : (
          <DefaultModalView
            title={`Withdraw ${isDETH ? 'dETH' : 'ETH'} to ${fromIndex ? 'save' : 'spend'}`}
            loading={isValidatorsDataLoading}
            className="w-full">
            <div className="mb-5">
              <div className={styles.textLabel}>
                Total balance to withdraw
                <Tooltip
                  message={
                    <div>
                      Withdrawing dETH to your wallet will make it spendable throughout DeFi. It
                      will be fungible with all dETH.&nbsp;
                      {fromIndex
                        ? 'This will move dETH to your wallet and savETH to your savETH index. '
                        : 'This will move your dETH to your wallet and savETH to the Open Index. '}
                      <a
                        href="https://help.joinstakehouse.com/en/articles/6206936-how-do-i-withdraw-my-deth"
                        target="_blank"
                        className={styles.learnMoreLink}
                        rel="noreferrer">
                        Learn More
                      </a>
                    </div>
                  }
                />
              </div>
              <div className={styles.field}>
                <div className="text-white text-xl font-medium">
                  {cutDecimals(isDETH ? totalWithdrawableDETH : formatEther(totalETH ?? 0), 3)}
                </div>
                <div
                  className="flex items-center gap-2 text-white px-3 py-1 rounded-full bg-white bg-opacity-10 cursor-pointer"
                  onClick={() => setIsOpen(true)}>
                  {isDETH ? (
                    <>
                      <DETHIcon />
                      dETH
                    </>
                  ) : (
                    <>
                      <EthIcon />
                      ETH
                    </>
                  )}
                  <SelectorIcon />
                </div>
              </div>
              {isSuccessful && (
                <div className="text-primary text-sm text-right mt-1">
                  Balance Report was successful!
                </div>
              )}
            </div>
            {!isReported && !isDETH ? (
              <Button size="lg" className="w-full" disabled={isReported} onClick={reportBalance}>
                Balance Report
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                disabled={
                  isDETH ? !Number(totalWithdrawableDETH) : !Number(totalETH) || !isReported
                }
                onClick={isDETH ? handleWithdrawDETH : handleWithdrawETH}>
                Confirm
              </Button>
            )}
          </DefaultModalView>
        )}
      </ModalDialog>
    </>
  )
}
