import { FC, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import { useFlaggedWallet } from 'hooks/useFlaggedWallet'
import { useNavigate } from 'react-router-dom'
import { Bottombar, NotSupportedMobile, Topbar } from './components'

import './styles.scss'

const DashboardLayout: FC = () => {
  const isFlagged = useFlaggedWallet()
  const navigate = useNavigate()

  useEffect(() => {
    const flaggedAddressStatus = async () => {
      const flagged = await isFlagged()
      if (flagged) {
        navigate('/sign-in')
      }
    }

    flaggedAddressStatus()
  }, [isFlagged])

  return (
    <div className="layout">
      <Topbar />
      {isMobile ? <NotSupportedMobile /> : <Outlet />}
      {!isMobile && <Bottombar />}
    </div>
  )
}

export default DashboardLayout
