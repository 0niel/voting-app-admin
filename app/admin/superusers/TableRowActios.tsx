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
import { useSupabase } from '@/lib/supabase/supabase-provider'

interface SuperusersTableRowActiosProps<TData> {
  row: Row<TData>
}

export function SuperusersTableRowActios<TData>({ row }: SuperusersTableRowActiosProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeleteSuperuser = async () => {
    if (!confirm('Вы уверены, что хотите удалить суперпользователя?')) {
      return
    }

    const userId = row.getValue('id')

    if (userId == (await supabase.auth.getUser()).data?.user?.id) {
      toast.error('Вы не можете удалить себя.')
      return
    }

    try {
      await supabase.from('superusers').delete().match({ user_id: userId }).throwOnError()

      toast.success('Суперпользователь успешно удален.')
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error('Произошла ошибка при удалении суперпользователя.')
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
          <DropdownMenuItem onClick={handleDeleteSuperuser}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  )
}
