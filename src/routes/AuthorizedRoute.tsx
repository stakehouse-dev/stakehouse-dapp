import { FC, PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'

const AuthorizedRoute: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation()
  const account = useAccount()
  const { isConnected, isConnecting } = useAccount()

  if (isConnecting) {
    return <></>
  }

  if (!account || !isConnected) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default AuthorizedRoute
