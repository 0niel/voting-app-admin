"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Database } from "@/lib/supabase/db-types"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"

import { AccessModeratorsTableRowActions } from "./TableRowActions"

export const columns: ColumnDef<
  Database["ovk"]["Tables"]["participants"]["Row"]
>[] = [
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("user_id")}
        </span>
      )
    },
  },

  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ФИО" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("full_name")}
        </span>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Почта" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("email")}
        </span>
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
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("created_at")}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <AccessModeratorsTableRowActions row={row} />,
  },
]
