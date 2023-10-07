import { Label } from '@radix-ui/react-dropdown-menu'
import { redirect } from 'next/navigation'

import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getAnswerOptionsByPoll,
  getEvents,
  getPollsByEvent,
  getSession,
  getSuperusers,
  getUsersPermissions,
} from '@/lib/supabase/supabase-server'

import ActivePollCard from './ActivePollCard'
import { columns, Poll } from './columns'
import CreatePollDialog from './DialogCreate'

export default async function Polls({ params: { eventId } }: { params: { eventId: number } }) {
  const [session, polls, superusers, usersPermissions] = await Promise.all([
    getSession(),
    getPollsByEvent(eventId),
    getSuperusers(),
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

  if (!isUserHasAllPermissions() && !isUserVotingModerator()) {
    return redirect('/')
  }

  const pollsWithAnswerOptions = await Promise.all(
    polls?.map(async (poll) => {
      const options = (await getAnswerOptionsByPoll(poll.id)) ?? []
      console.log(options)
      return { ...poll, options } as Poll
    }) ?? [],
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Голосования</h2>
        <p className='text-muted-foreground'>
          Создайте новое голосование, чтобы участники мероприятия смогли оставить свой голос
        </p>
      </div>
      <CreatePollDialog />
      <ActivePollCard polls={polls ?? []} />

      <DataTable data={pollsWithAnswerOptions ?? []} columns={columns} filterColumn='question' />
    </div>
  )
}
