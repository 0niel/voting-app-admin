'use client'

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader'
import { ColumnDef } from '@tanstack/react-table'
import { UserToView } from '@/lib/supabase/supabase-server'
import { SuperusersTableRowActios } from './SuperusersTableRowActios'

export const columns: ColumnDef<UserToView>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Id' />,
    cell: ({ row }) => <div className='w-[300px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
    cell: ({ row }) => {
      return <span className='truncate font-medium'>{row.getValue('email')}</span>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Создан' />,
    cell: ({ row }) => {
      return <span className='truncate font-medium'>{row.getValue('created_at')}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <SuperusersTableRowActios row={row} />,
  },
]
