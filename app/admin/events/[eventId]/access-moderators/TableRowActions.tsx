'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

interface AccessModeratorsTableRowActionsProps<TData> {
  row: Row<TData>
}

export function AccessModeratorsTableRowActions<TData>({
  row,
}: AccessModeratorsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeleteAccessModerator = async () => {
    if (!confirm('Вы уверены, что хотите удалить модератора доступа?')) {
      return
    }

    try {
      await supabase
        .from('users_permissions')
        .upsert({
          user_id: (row.original as Database['ovk']['Tables']['users_permissions']['Row']).user_id,
          event_id: (row.original as Database['ovk']['Tables']['users_permissions']['Row'])
            .event_id,
          is_access_moderator: false,
        })
        .throwOnError()

      toast.success('Модератор доступа успешно удален из мероприятия.')
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error('Произошла ошибка при удалении модератора доступа из мероприятия.')
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
          <DropdownMenuItem onClick={handleDeleteAccessModerator}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  )
}
