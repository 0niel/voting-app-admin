import { redirect } from 'next/navigation'

import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import {
  getEvents,
  getSession,
  getSuperusers,
  getUsersPermissions,
} from '@/lib/supabase/supabase-server'

import { columns } from './columns'
import CreateEventDialogButton from './CreateEventDialog'

export default async function Events() {
  const [session, events, superusers, usersPermissions] = await Promise.all([
    getSession(),
    getEvents(),
    getSuperusers(),
    getUsersPermissions(),
  ])

  const user = session?.user

  if (!user) {
    return redirect('/404')
  }

  const isUserHasAllPermissions = () => {
    return superusers?.some((superuser) => superuser.user_id === user?.id)
  }

  const isUserVotingModerator = () => {
    return usersPermissions?.some(
      (permission) => permission.user_id === user?.id && permission.is_voting_moderator,
    )
  }

  const isUserAccessModerator = () => {
    return usersPermissions?.some(
      (permission) => permission.user_id === user?.id && permission.is_access_moderator,
    )
  }

  if (!isUserHasAllPermissions() && !isUserVotingModerator() && !isUserAccessModerator()) {
    return redirect('/404')
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Список меоприятий</h2>
        <p className='text-muted-foreground'>
          Список всех мероприятий, созданных в системе. Меропрития — это события, в рамках которых
          проводятся голосования
        </p>
      </div>
      <CreateEventDialogButton />
      <DataTable data={events ?? []} columns={columns} filterColumn='name' />
    </div>
  )
}
