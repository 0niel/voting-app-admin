import { redirect } from 'next/navigation'

import { DataTable } from '@/components/table/DataTable'
import { Button } from '@/components/ui/button'
import { getEvents, getResourses, getSession, getSuperusers } from '@/lib/supabase/supabase-server'

import { columns } from './columns'
import CreateResourceDialogButton from './CreateResourceDialog'

export const dynamic = 'force-dynamic'

export default async function Events() {
  const [session, resources, superusers, events] = await Promise.all([
    getSession(),
    getResourses(),
    getSuperusers(),
    getEvents(),
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

  return (
    <div className='space-y-4'>
      <div className='flex flex-col space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>Ресусы</h2>
        <p className='text-muted-foreground'>
          Ресурсы - это ссылки на внешние ресурсы, которые могут быть полезными для участников
          мероприятия. Они отображаются в выдвижной панели мобильного приложения
        </p>
      </div>
      <CreateResourceDialogButton events={events ?? []} />
      <DataTable data={resources ?? []} columns={columns} filterColumn='name' />
    </div>
  )
}
