import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useBlockNumber } from 'wagmi'
import { Helmet } from 'react-helmet'

import { DetailsBody, DetailsFooter, DetailsHeader } from 'components/app'

import { useSDK, useUser } from 'hooks'
import { ValidatorLifecycleStatuses } from 'types'

import { ReactComponent as IconArrowUpRightGreen } from 'assets/images/icon-arrow-top-right-green.svg'
import './styles.scss'

const Details = () => {
  const [knotData, setKnotData] = useState<any[]>([])

  const { id } = useParams()
  const { sdk } = useSDK()
  const accountData = useAccount()
  const { data: currentBlock } = useBlockNumber()

  const { validators: data, refetchValidators } = useUser()

  const refetchKnot = async () => {
    if (sdk && accountData) {
      const knotData = await sdk.wizard.getCumulativeValidatorIndexes(
        accountData.address?.toLowerCase() || ''
      )
      setKnotData(knotData)
    }
  }

  useEffect(() => {
    refetchKnot()
  }, [sdk, accountData])

  const validator = useMemo(() => {
    if (id && data) {
      return data.find((v) => v.id === id)
    }

    return null
  }, [id, data])

  const status = useMemo(() => {
    if (validator && knotData) {
      const lifecycleStatus = validator.lifecycleStatus
      const newIndexId = knotData.length > 0 ? knotData[0].id : 0

      if (
        !currentBlock ||
        !validator.mintFromBlockNumber ||
        currentBlock < validator.mintFromBlockNumber
      )
        return 'PENDING'

      if (lifecycleStatus === ValidatorLifecycleStatuses.depositCompleted) return 'MINTABLE'

      if (lifecycleStatus === ValidatorLifecycleStatuses.derivativesMinted) {
        if (validator.knotMetadata?.isPartOfIndex) {
          if (newIndexId === validator.knotMetadata?.savETHIndexId) {
            return 'INDEXED'
          } else {
            return 'MINTED'
          }
        } else {
          return 'WITHDRAWN'
        }
      }
      if (lifecycleStatus === ValidatorLifecycleStatuses.unstaked) return 'UNSTAKED'

      if (lifecycleStatus === ValidatorLifecycleStatuses.exited) return 'RAGE QUIT'
    }

    return 'PENDING'
  }, [validator, knotData, currentBlock])

  const handleRefetch = () => {
    refetchKnot()
    refetchValidators()
  }

  return (
    <>
      <Helmet>
        <title>Validator Details - Stakehouse</title>
      </Helmet>
      <div className="details">
        <div className="details__container">
          <DetailsHeader validator={validator} status={status} />
          <DetailsBody validator={validator} status={status} />
          <DetailsFooter validator={validator} status={status} onRefresh={handleRefetch} />
          <div className="w-full flex justify-center mt-4">
            <a
              href="https://help.joinstakehouse.com/en/"
              target={'_blank'}
              rel={'noopener noreferrer'}>
              <span className="flex items-center gap-3 text-sm font-medium text-primary">
                Learn More <IconArrowUpRightGreen />
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Details
