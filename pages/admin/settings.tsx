import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'
import RouteGuard from '@/components/RouteGuard'

const Settings = () => {
  return <span>settings</span>
}

Settings.getLayout = function getLayout(page: ReactElement) {
  return (
    <RouteGuard>
      <LayoutWithDrawer>{page}</LayoutWithDrawer>
    </RouteGuard>
  )
}

export default Settings
