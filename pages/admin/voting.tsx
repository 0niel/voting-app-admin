import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'
import RouteGuard from '@/components/RouteGuard'

const Voting = () => {
  return <span>voting</span>
}

Voting.getLayout = function getLayout(page: ReactElement) {
  return (
    <RouteGuard>
      <LayoutWithDrawer>{page}</LayoutWithDrawer>
    </RouteGuard>
  )
}

export default Voting
