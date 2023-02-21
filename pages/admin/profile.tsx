import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement } from 'react'
import useUser from '@/lib/useUser'
import { useAppwrite } from '@/context/AppwriteContext'

const Profile = () => {
  const { user } = useUser()
  const { account } = useAppwrite()

  console.log(account)
  return (
    <>
      <h2 className='text-xl'>ID</h2>
      <p>{user?.userData?.$id || 'Отсутвствует'}</p>
      <h2 className='text-xl'>Имя</h2>
      <p>{user?.userData?.name || 'Отсутвствует'}</p>
      <h2 className='text-xl'>Почта</h2>
      <p>{user?.userData?.email || 'Отсутвствует'}</p>
      <h2 className='text-xl'>Телофон</h2>
      <p>{user?.userData?.phone || 'Отсутвствует'}</p>
    </>
  )
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Profile
