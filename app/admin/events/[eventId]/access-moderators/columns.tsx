"use client"

import { ColumnDef } from "@tanstack/react-table"

import { formatDate } from "@/lib/formatDate"
import { UserToView } from "@/lib/supabase/supabase-server"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"

import { AccessModeratorsTableRowActions } from "./TableRowActions"

export const columns: ColumnDef<UserToView>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => <div className="w-[300px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <span className="truncate font-medium">{row.getValue("email")}</span>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Создан" />
    ),
    cell: ({ row }) => {
      return (
        <span className="truncate font-medium">
          {formatDate(row.getValue("created_at"))}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <AccessModeratorsTableRowActions row={row} />,
  },
]
