import { ReactElement } from 'react'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import PersonalInformationCard from '@/components/profile/PersonalInformationCard'

const Profile = () => {
  return (
    <div className='grid grid-flow-row-dense gap-4 p-3'>
      <PersonalInformationCard />
    </div>
  )
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Profile
