"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CheckIcon, XIcon } from "lucide-react"

import { PollDisplayMode } from "@/lib/PollDisplayMode"
import { formatDate } from "@/lib/formatDate"
import { Database } from "@/lib/supabase/db-types"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"

import { PollsTableRowActions } from "./TableRowActions"

type Option = Database["ovk"]["Tables"]["answer_options"]["Row"]

export type Poll = Database["ovk"]["Tables"]["polls"]["Row"] & {
  options: Option[]
}

export const columns: ColumnDef<Poll>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => <div className="w-[50px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "question",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Вопрос" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("question")}
        </span>
      )
    },
  },
  {
    accessorKey: "display_mode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Режим отображения" />
    ),
    cell: ({ row }) => {
      switch (row.getValue("display_mode")) {
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
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Изначальная длительность (сек.)"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>{row.getValue("duration")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "start_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Начало" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>
            {row.getValue("start_at")
              ? formatDate(row.getValue("start_at"))
              : "нет"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "end_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Конец" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>
            {row.getValue("end_at")
              ? formatDate(row.getValue("end_at"))
              : "нет"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "options",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Варианты ответа" />
    ),
    cell: ({ row }) => {
      const options = row.getValue("options") as Option[]
      return (
        <div className="flex w-[150px] flex-wrap gap-1">
          {options.map((option) => (
            <Badge key={option.id} className="mr-2" variant="outline">
              {option.text}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "is_finished",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Голоса" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[150px] items-center">
          {row.getValue("is_finished") ? (
            <CheckIcon className="mr-2 h-4 w-4 text-green-400" />
          ) : (
            <XIcon className="mr-2 h-4 w-4 text-red-400" />
          )}
          <span>
            {row.getValue("is_finished") ? "Подсчитаны" : "Промежуточные"}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PollsTableRowActions row={row} />,
  },
]
