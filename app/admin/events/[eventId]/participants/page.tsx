import { redirect } from 'next/navigation'

import { columns } from '@/app/admin/events/[eventId]/participants/columns'
import { DataTable } from '@/components/table/DataTable'
import {
  getEventParticipants,
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
} from '@/lib/supabase/supabase-server'

import CreateMemberDialogButton from './CreateMemberDialogButton'

export default async function Participants({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, participants, superusers, users, usersPermissions] = await Promise.all([
    getSession(),
    getEventParticipants(eventId),
    getSuperusers(),
    getUsers(),
    getUsersPermissions(),
  ])

  const user = session?.user

  if (!user) {
    return redirect('/')
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
    return redirect('/')
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Список участников</h2>
        <p className='text-muted-foreground'>
          Список всех участников зарегистрированных на меропритие. Участники могут принимать
          участние в голосованиях
        </p>
      </div>
      <CreateMemberDialogButton users={users ?? []} eventId={eventId} />
      <DataTable data={participants ?? []} columns={columns} filterColumn='question' />
    </div>
  )
}
