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

interface VotingModeratorsTableRowActionsProps<TData> {
  row: Row<TData>
}

export function VotingModeratorsTableRowActions<TData>({
  row,
}: VotingModeratorsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()
  const { eventId } = useParams()

  const handleDeleteVotingModerator = async () => {
    if (!confirm("Вы уверены, что хотите удалить модератора голосования?")) {
      return
    }

    try {
      await supabase
        .from("users_permissions")
        .update({
          is_voting_moderator: false,
        })
        .eq("user_id", row.getValue("id"))
        .eq("event_id", eventId)
        .throwOnError()

      toast.success("Модератор голосования успешно удален из мероприятия.")
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error("Произошла ошибка при удалении модератора голосования.")
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
          <DropdownMenuItem onClick={handleDeleteVotingModerator}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  )
}
