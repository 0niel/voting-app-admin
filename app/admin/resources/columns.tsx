"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LinkIcon } from "lucide-react"

import { Database } from "@/lib/supabase/db-types"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"

import { ResourcesTableRowActios } from "./TableRowActios"

const feather = require("feather-icons")

export const columns: ColumnDef<
  Database["ovk"]["Tables"]["resources"]["Row"]
>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "svg_icon",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Иконка" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <div
            dangerouslySetInnerHTML={{
              __html: feather.icons[row.original.svg_icon].toSvg(),
            }}
            className="h-8 w-8"
          />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Название" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-medium">
          {row.getValue("name")}
        </span>
      )
    },
  },
  {
    accessorKey: "url",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ссылка" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <Button
            variant="link"
            onClick={() => {
              window.open(row.original.url)
            }}
          >
            Перейти
            <LinkIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ResourcesTableRowActios row={row} />,
  },
]
