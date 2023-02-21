import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement, useEffect, useState } from 'react'
import useUser from '@/lib/useUser'
import { useAppwrite } from '@/context/AppwriteContext'
import { Teams } from 'appwrite'
import Link from 'next/link'

const Profile = () => {
  const { user } = useUser()
  const { client } = useAppwrite()
  const [teams, setTeams] = useState<string[]>([])

  useEffect(() => {
    async function getTeams() {
      console.log(client)
      const teams = (await new Teams(client!).list()).teams.map((team) => team.name)
      setTeams(teams)
    }
    getTeams().then(() => {})
  }, [client])

  return (
    <>
      <h2 className='text-xl'>ID</h2>
      <p>{user?.userData?.$id || 'Отсутвствует'}</p>
      {user?.userData?.name && (
        <>
          <h2 className='text-xl'>Имя</h2>
          <p>{user?.userData?.name}</p>
        </>
      )}
      {user?.userData?.email && (
        <>
          <h2 className='text-xl'>Почта</h2>
          <Link href={`mailto:${user?.userData?.email}`} className='link'>
            {user?.userData?.email}
          </Link>
        </>
      )}
      {user?.userData?.phone && (
        <>
          <h2 className='text-xl'>Телефон</h2>
          <Link href={`tel:${user?.userData?.phone}`} className='link'>
            {user?.userData?.phone}
          </Link>
        </>
      )}
      {teams.length > 0 && (
        <>
          <h2 className='text-xl'>Команды</h2>
          <ul className='list-disc'>
            {teams.map((team, index) => (
              <li key={index}>{team}</li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Profile
