'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

import CopyEventDialog from './DialogCopy'
import UpdateEventDialog from './DialogUpdate'

interface EventsTableRowActionsProps<TData> {
  row: Row<TData>
}

export function EventsTableRowActions<TData>({ row }: EventsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeleteEvent = async () => {
    if (!confirm('Вы уверены, что хотите удалить мероприятие?')) {
      return
    }

    try {
      await supabase
        .from('events')
        .delete()
        .match({ id: (row.original as Database['ovk']['Tables']['events']['Row']).id })
        .throwOnError()

      toast.success('Мероприятие успешно удалено.')
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error('Произошла ошибка при удалении мероприятия.')
    }
  }

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Меню</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
            Редактировать
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setCopyDialogOpen(true)}>Копия</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDeleteEvent}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateEventDialog
        event={row.original as any}
        open={updateDialogOpen}
        setOpen={setUpdateDialogOpen}
      />

      <CopyEventDialog
        event={row.original as any}
        open={copyDialogOpen}
        setOpen={setCopyDialogOpen}
      />
    </>
  )
}
