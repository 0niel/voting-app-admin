import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'

const PollList = () => {
  return <span>список голосований</span>
}

PollList.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default PollList
