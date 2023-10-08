"use client"

import { useParams } from "next/navigation"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import toast from "react-hot-toast"

import { Database } from "@/lib/supabase/db-types"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AccessModeratorsTableRowActionsProps<TData> {
  row: Row<TData>
}

export function AccessModeratorsTableRowActions<TData>({
  row,
}: AccessModeratorsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()
  const { eventId } = useParams()

  const handleDeleteAccessModerator = async () => {
    if (!confirm("Вы уверены, что хотите удалить модератора доступа?")) {
      return
    }

    try {
      await supabase
        .from("users_permissions")
        .update({
          is_access_moderator: false,
        })
        .eq("user_id", row.getValue("id"))
        .eq("event_id", eventId)
        .throwOnError()

      toast.success("Модератор доступа успешно удален из мероприятия.")
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error(
        "Произошла ошибка при удалении модератора доступа из мероприятия."
      )
    }
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Меню</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleDeleteAccessModerator}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  )
}
