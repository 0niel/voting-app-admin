'use client'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader'
import { Database } from '@/lib/supabase/db-types'

import { VotingModeratorsTableRowActions } from './TableRowActions'

export const columns: ColumnDef<Database['ovk']['Tables']['participants']['Row']>[] = [
  {
    accessorKey: 'user_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Id' />,
    cell: ({ row }) => {
      return <span className='max-w-[500px] truncate font-medium'>{row.getValue('user_id')}</span>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Дата создания' />,
    cell: ({ row }) => {
      return (
        <span className='max-w-[500px] truncate font-medium'>{row.getValue('created_at')}</span>
      )
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Роль' />,
    cell: ({ row }) => {
      return <span className='max-w-[500px] truncate font-medium'>{row.getValue('role')}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <VotingModeratorsTableRowActions row={row} />,
  },
]
