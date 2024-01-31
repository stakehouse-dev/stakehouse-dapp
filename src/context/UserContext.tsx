import {
  createContext,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react'
import { useQuery } from '@apollo/client'
import { useAccount } from 'wagmi'

import { savETHIndexGlobalQuery } from 'graphql/queries/knot'
import { ValidatorT } from 'types'
import { useSDK } from 'hooks'
import { useQueryString } from 'hooks/useQueryString'

export interface UserContextProps {
  userAddress: string
  validators: ValidatorT[]
  getValidatorById: (id: string) => ValidatorT | null
  isValidatorsDataLoading: boolean
  refetchValidators: () => Promise<any>

  knotsData: any
  isKnotsDataLoading: boolean
  refetchKnotsData: () => Promise<any>

  globalSavIndexes: any
  refetchGlobalKnot: () => Promise<any>

  activityData: any
  isActivityLoading: boolean
  refetchActivity: () => Promise<any>

  refetchUserData: (tx?: any, blocksDelay?: number) => Promise<any>
  isUserDataLoading: boolean
}

export const UserContext = createContext<UserContextProps>({
  userAddress: '',
  validators: [],
  getValidatorById: (id: string) => null,
  isValidatorsDataLoading: true,
  refetchValidators: async () => {},
  knotsData: {},
  isKnotsDataLoading: true,
  refetchKnotsData: async () => {},
  globalSavIndexes: null,
  refetchGlobalKnot: async () => {},
  activityData: [],
  isActivityLoading: true,
  refetchActivity: async () => {},
  refetchUserData: async () => {},
  isUserDataLoading: true
})

const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isActivityLoading, setActivityLoading] = useState(false)
  const [activityData, setActivityData] = useState<any[]>()
  const [isValidatorsDataLoading, setValidatorsDataLoading] = useState(false)
  const [validators, setValidators] = useState<ValidatorT[]>([])
  const [isRefetching, setIsRefetching] = useState(false)
  const [knotsData, setKnotsData] = useState<any[]>([])
  const [isKnotsDataLoading, setKnotsDataLoading] = useState(false)

  const account = useAccount()
  const [spoofedAddress, setSpoofedAddress] = useState<string>('')

  const queryString = useQueryString()
  const spoofedAddressFromQuery = queryString.get('address') ?? ''

  useEffect(() => {
    setSpoofedAddress(spoofedAddressFromQuery)
  }, [])

  const { sdk } = useSDK()

  const userAddress = useMemo(
    () =>
      // eslint-disable-next-line no-undef
      spoofedAddress && process.env.REACT_APP_DEBUG === 'true'
        ? spoofedAddress
        : account?.address || '',
    [spoofedAddress, account]
  )

  const refetchValidators = useCallback(async () => {
    if (sdk && userAddress) {
      setValidatorsDataLoading(true)
      try {
        const validators = await sdk.wizard.getCumulativeListOfValidators(userAddress.toLowerCase())
        setValidators(validators)
      } catch (e) {
        console.log('fetch validators error: ', e)
        setValidators([])
      }
      setValidatorsDataLoading(false)
    }
  }, [sdk, userAddress])

  const refetchActivity = useCallback(async () => {
    if (sdk && userAddress) {
      setActivityLoading(true)
      try {
        const activities = await sdk.wizard.getCumulativeActivity(userAddress.toLocaleLowerCase())
        setActivityData(activities)
      } catch (e) {
        console.log('fetch activity error: ', e)
        setActivityData([])
      }
      setActivityLoading(false)
    }
  }, [sdk, userAddress])

  const refetchKnotsData = useCallback(async () => {
    if (sdk && userAddress) {
      setKnotsDataLoading(true)
      try {
        const knotData = await sdk.wizard.getCumulativeValidatorIndexDetails(
          userAddress.toLowerCase() || ''
        )
        setKnotsData(knotData)
      } catch (e) {
        console.log('fetch knots error: ', e)
        setKnotsData([])
      }
      setKnotsDataLoading(false)
    }
  }, [sdk, userAddress])

  const {
    data: { savETHIndexGlobals: globalSavIndexes = {} } = {},
    loading: isSavETHIndexGlobalsLoading,
    refetch: refetchGlobalKnot
  } = useQuery(savETHIndexGlobalQuery, {
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    refetchValidators()
    refetchActivity()
    refetchKnotsData()
  }, [refetchValidators, refetchActivity, refetchKnotsData])

  const getValidatorById = (id: string) => validators.find((item) => item.id === id) || null

  const isUserDataLoading =
    isRefetching || isValidatorsDataLoading || isKnotsDataLoading || isSavETHIndexGlobalsLoading

  async function refetchUserData(tx?: any, blocksDelay = 0) {
    setIsRefetching(true)
    if (tx && blocksDelay) await tx.wait(blocksDelay)
    await refetchValidators()
    await refetchGlobalKnot()
    await refetchActivity()
    await refetchKnotsData()
    setIsRefetching(false)
  }

  return (
    <UserContext.Provider
      value={{
        userAddress,
        validators,
        getValidatorById,
        isValidatorsDataLoading,
        refetchValidators,
        knotsData,
        isKnotsDataLoading,
        refetchKnotsData,
        globalSavIndexes,
        refetchGlobalKnot,
        activityData,
        isActivityLoading,
        refetchActivity,
        refetchUserData,
        isUserDataLoading
      }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
