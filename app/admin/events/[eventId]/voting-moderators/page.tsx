import { redirect } from 'next/navigation'

import { DataTable } from '@/components/table/DataTable'
import {
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
  UserToView,
} from '@/lib/supabase/supabase-server'

import { columns } from './columns'
import CreateVotingModeratorDialogButton from './DialogCreate'

export default async function VotingModerators({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, superusers, users, usersPermissions] = await Promise.all([
    getSession(),
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

  const votingModerators = users
    ?.map((realUser) => {
      return users?.find((user) => user.id === realUser.id)
    })
    .filter((user) => user !== undefined) as UserToView[]

  return (
    <div className='space-y-4'>
      <div className='flex flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Список модераторов голосования</h2>
        <p className='text-muted-foreground'>
          Список всех модераторов голосования меропрития. Модераторы голосования могут создавать
          новые голосования
        </p>
      </div>
      <CreateVotingModeratorDialogButton users={users ?? []} eventId={eventId} />
      <DataTable data={votingModerators ?? []} columns={columns} filterColumn='full_name' />
    </div>
  )
}
