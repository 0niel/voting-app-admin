'use client'

import { DialogTrigger } from '@radix-ui/react-dialog'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

import UpdateEventDialog from './DialogUpdate'

interface PollsTableRowActionsProps<TData> {
  row: Row<TData>
}

export function PollsTableRowActions<TData>({ row }: PollsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeleteEvent = async () => {
    if (!confirm('Вы уверены, что хотите удалить это голосование?')) {
      return
    }

    try {
      await supabase
        .from('polls')
        .delete()
        .match({ id: (row.original as Database['ovk']['Tables']['polls']['Row']).id })
        .throwOnError()

      toast.success('Голосование успешно удалено.')
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error('Произошла ошибка при удалении голосования.')
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
        poll={row.original as any}
        open={updateDialogOpen}
        setOpen={setUpdateDialogOpen}
      />
      {/* 
      <CopyEventDialog
        event={row.original as any}
        open={copyDialogOpen}
        setOpen={setCopyDialogOpen}
      /> */}
    </>
  )
}
