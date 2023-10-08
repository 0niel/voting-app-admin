"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { CheckIcon, LinkIcon, XIcon } from "lucide-react"

import { Database } from "@/lib/supabase/db-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"

import { EventsTableRowActions } from "./TableRowActions"

export const columns: ColumnDef<Database["ovk"]["Tables"]["events"]["Row"]>[] =
  [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      cell: ({ row }) => <div className="w-[20px]">{row.getValue("id")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "logo_url",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Лого" />
      ),
      cell: ({ row }) => {
        return (
          <Avatar className="h-16 w-16">
            <AvatarImage src={row.getValue("logo_url")}></AvatarImage>
            <AvatarFallback></AvatarFallback>
          </Avatar>
        )
      },
      enableSorting: false,
      enableHiding: false,
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
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Активно?" />
      ),
      cell: ({ row }) => {
        const event = row.original
        return (
          <div className="flex w-[100px] items-center">
            {event.is_active ? (
              <CheckIcon className="mr-2 h-4 w-4 text-green-400" />
            ) : (
              <XIcon className="mr-2 h-4 w-4 text-red-400" />
            )}
            <span>{event.is_active ? "Активно" : "Неактивно"}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "access_moderators",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Мод. доступа" />
      ),
      cell: ({ row }) => {
        const event = row.original
        return (
          <div className="flex w-[100px] items-center">
            <Link href={`/admin/events/${event.id}/access-moderators`}>
              <Button variant="link">
                Перейти
                <LinkIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "voting_moderators",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Мод. голосований" />
      ),
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const router = useRouter()

        const event = row.original
        return (
          <div className="flex w-[100px] items-center">
            <Button
              variant="link"
              onClick={() => {
                router.push(`/admin/events/${event.id}/voting-moderators`)
              }}
            >
              Перейти
              <LinkIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "participants",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Участники" />
      ),
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const router = useRouter()

        const event = row.original
        return (
          <div className="flex w-[100px] items-center">
            <Button
              variant="link"
              onClick={() => {
                router.push(`/admin/events/${event.id}/participants`)
              }}
            >
              Перейти
              <LinkIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "polls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Голосования" />
      ),
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const router = useRouter()

        const event = row.original
        return (
          <div className="flex w-[100px] items-center">
            <Button
              variant="link"
              onClick={() => {
                router.push(`/admin/events/${event.id}/polls`)
              }}
            >
              Перейти
              <LinkIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => <EventsTableRowActions row={row} />,
    },
  ]
