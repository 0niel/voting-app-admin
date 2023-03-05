import { ReactElement } from 'react'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'

const Settings = () => {
  return <span>settings</span>
}

Settings.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Settings
