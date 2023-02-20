import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'

const Voting = () => {
  return <span>voting</span>
}

Voting.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Voting
