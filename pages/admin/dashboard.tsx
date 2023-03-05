import { ReactElement } from 'react'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'

const Dashboard = () => {
  return <span>агрегация голосования</span>
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Dashboard
