'use client'

import { Label } from '@radix-ui/react-dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { getTime } from 'date-fns'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getActivePoll } from '@/lib/getActivePoll'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

type Poll = Database['ovk']['Tables']['polls']['Row']

export default function ActivePollCard({ polls }: { polls: Poll[] }) {
  const { supabase } = useSupabase()

  const [realtimePolls, setRealtimePolls] = useState(polls)

  const [activePoll, setActivePoll] = useState<Poll | null>(null)

  const changes = supabase
    .channel('table-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'ovk',
        table: 'polls',
      },
      (payload) => {
        console.log('Payload: ', payload)
      },
    )
    .subscribe()

  useEffect(() => {
    setActivePoll(getActivePoll(realtimePolls))
    console.log(realtimePolls)
  }, [realtimePolls])

  return activePoll ? (
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
  ) : (
    <></>
  )
}
