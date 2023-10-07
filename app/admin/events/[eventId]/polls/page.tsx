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

import { columns, Poll } from './columns'

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

      <Card>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>Идёт голосование!</CardTitle>
          <CardDescription>Enter your email below to create your account</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid grid-cols-2 gap-6'>
            <Button variant='outline'>Остановить</Button>
            <Button variant='outline'>Сбросить</Button>
          </div>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className='w-full'>Create account</Button>
        </CardFooter>
      </Card>
      <DataTable data={pollsWithAnswerOptions ?? []} columns={columns} filterColumn='question' />
    </div>
  )
}
