import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'

const Dashboard = () => {
  return <span>агрегация голосования</span>
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Dashboard
