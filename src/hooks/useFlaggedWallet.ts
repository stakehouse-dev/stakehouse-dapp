import { useCallback } from 'react'
import { useAccount } from 'wagmi'

export function useFlaggedWallet() {
  const { address } = useAccount()

  const isFlagged = useCallback(async () => {
    if (address !== undefined) {
      try {
        const response = await fetch('https://trm.joinstakehouse.com/risk', {
          method: 'POST',
          body: JSON.stringify({ address: address })
        })
        const responseData = await response.json()
        const isAllowed: boolean = responseData.allowed
        return !isAllowed
      } catch (error) {
        console.log('Error useFlaggedWallet:', error)
        return false
      }
    }
  }, [address])

  return isFlagged
}
