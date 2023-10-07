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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

interface ParticipantsTableRowActionsProps<TData> {
  row: Row<TData>
}

// id, имя, почта, дата создания, роль
export function ParticipantsTableRowActions<TData>({
  row,
}: ParticipantsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeleteParticipant = async () => {
    if (!confirm('Вы уверены, что хотите удалить участника?')) {
      return
    }

    try {
      await supabase
        .from('participants')
        .delete()
        .match({ id: row.getValue('id') })
        .throwOnError()

      toast.success('Участник успешно удален из мероприятия.')
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error('Произошла ошибка при удалении участника мероприятия.')
    }
  }

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
          <DropdownMenuItem onClick={handleDeleteParticipant}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
