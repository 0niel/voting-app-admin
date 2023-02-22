import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'
import PersonalInformationCard from '@/components/profile/PersonalInformationCard'

const Profile = () => {
  return (
    <>
      <PersonalInformationCard />
    </>
  )
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Profile
