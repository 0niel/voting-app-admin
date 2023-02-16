import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'

const Settings = () => {
  return (
    <span>
      settings
    </span>
  )
}

Settings.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Settings
