'use client'

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon } from 'lucide-react'
import { Database } from '@/lib/supabase/db-types'
import { LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PollDisplayMode } from '@/lib/PollDisplayMode'
import { formatDate } from '@/lib/formatDate'
import { Badge } from '@/components/ui/badge'
import CountDown from '@/components/events/polls/CountDown'

type Option = Database['ovk']['Tables']['answer_options']['Row']

export type Poll = Database['ovk']['Tables']['polls']['Row'] & {
  options: Option[]
}

export const columns: ColumnDef<Poll>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Id' />,
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'question',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Вопрос' />,
    cell: ({ row }) => {
      return <span className='max-w-[500px] truncate font-medium'>{row.getValue('question')}</span>
    },
  },
  {
    accessorKey: 'display_mode',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Режим отображения' />,
    cell: ({ row }) => {
      switch (row.getValue('display_mode')) {
        case PollDisplayMode.default:
          return <span>Варианты ответа и кол-во голосов</span>
        case PollDisplayMode.only_votes_count:
          return <span>Кол-во проголосовавших</span>
        case PollDisplayMode.show_voters:
          return <span>Варианты, кол-во и проголосовавшие</span>
        default:
          return <span>Неизвестный режим</span>
      }
    },
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Изначальная длительность (сек.)' />
    ),
    cell: ({ row }) => {
      ;<div className='flex w-[100px] items-center'>
        <span>{row.getValue('duration')}</span>
      </div>
    },
  },
  {
    accessorKey: 'start_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Начало' />,
    cell: ({ row }) => {
      ;<div className='flex w-[100px] items-center'>
        <span>{row.getValue('start_at') ? formatDate(row.getValue('start_at')) : 'нет'}</span>
      </div>
    },
  },
  {
    accessorKey: 'end_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Конец' />,
    cell: ({ row }) => {
      ;<div className='flex w-[100px] items-center'>
        <span>{row.getValue('end_at') ? formatDate(row.getValue('end_at')) : 'нет'}</span>
      </div>
    },
  },
  {
    accessorKey: 'options',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Варианты ответа' />,
    cell: ({ row }) => {
      const options = row.getValue('options') as Option[]
      return (
        <div className='flex w-[100px] items-center'>
          {options.map((option) => (
            <Badge key={option.id} className='mr-2' variant='outline'>
              {option.text}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'is_finished',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Голоса' />,
    cell: ({ row }) => {
      ;<span>{row.getValue('is_finished') ? '✅Подсчитаны' : '❌Промежуточные'}</span>
    },
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <EventsTableRowActions row={row} />,
  // },
]
