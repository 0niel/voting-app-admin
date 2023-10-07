import {
  UserToView,
  getEvents,
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
} from '@/lib/supabase/supabase-server'
import { redirect } from 'next/navigation'
import { DataTable } from '@/components/table/DataTable'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import CreateSuperuserDialogButton from './CreateSuperuserDialog'

export const dynamic = 'force-dynamic'

export default async function Events() {
  const [session, superusers, users] = await Promise.all([
    getSession(),
    getSuperusers(),
    getUsers(),
  ])

  const user = session?.user

  if (!user) {
    return redirect('/404')
  }

  const isUserHasAllPermissions = () => {
    return superusers?.some((superuser) => superuser.user_id === user?.id)
  }

  if (!isUserHasAllPermissions()) {
    return redirect('/404')
  }

  const superusersUsers = superusers
    ?.map((superuser) => {
      const user = users?.find((user) => user.id === superuser.user_id)
      return user
    })
    .filter((user) => user !== undefined) as UserToView[]

  return (
    <div className='space-y-4'>
      <div className='flex flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Суперпользватели</h2>
        <p className='text-muted-foreground'>
          Супепользователи обладают всеми правами и могут создавать мероприятия и голосования,
          добавлять модераторов доступа, участников
        </p>
      </div>
      <CreateSuperuserDialogButton users={users ?? []} />
      <DataTable data={superusersUsers ?? []} columns={columns} filterColumn='email' />
    </div>
  )
}
