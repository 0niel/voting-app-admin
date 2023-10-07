'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { Database } from '@/lib/supabase/db-types'
import toast from 'react-hot-toast'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import UpdateResourceDialogContent from './UpdateResourceDialogContent'

interface ResourcesTableRowActiosProps<TData> {
  row: Row<TData>
}

export function ResourcesTableRowActios<TData>({ row }: ResourcesTableRowActiosProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeleteSuperuser = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот ресурс?')) {
      return
    }

    const id = row.getValue('id')
    try {
      await supabase.from('resources').delete().match({ id: id }).throwOnError()

      toast.success('Ресурс успешно удален.')
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error('Произошла ошибка при удалении ресурса.')
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
          <DropdownMenuItem onClick={handleDeleteSuperuser}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateResourceDialogContent resource={row.original as any} />
    </Dialog>
  )
}
