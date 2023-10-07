'use client'

import { DialogTrigger } from '@radix-ui/react-dialog'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
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

import UpdateEventDialogContent from './UpdateEventDialogContent'

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

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Меню</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DialogTrigger asChild>
            <DropdownMenuItem>Редактировать</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem>Копия</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDeleteEvent}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateEventDialogContent event={row.original as any} />
    </Dialog>
  )
}
