"use client"

import { useState } from "react"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { PlayIcon, StopCircleIcon } from "lucide-react"
import toast from "react-hot-toast"

import { Database } from "@/lib/supabase/db-types"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import CopyPollDialog from "./DialogCopy"
import UpdateEventDialog from "./DialogUpdate"

interface PollsTableRowActionsProps<TData> {
  row: Row<TData>
}

export function PollsTableRowActions<TData>({
  row,
}: PollsTableRowActionsProps<TData>) {
  const { supabase } = useSupabase()

  const handleDeletePoll = async () => {
    if (!confirm("Вы уверены, что хотите удалить это голосование?")) {
      return
    }

    try {
      await supabase
        .from("polls")
        .delete()
        .match({ id: row.getValue("id") })
        .throwOnError()

      toast.success("Голосование успешно удалено.")
      window.location.reload()
    } catch (error: any) {
      console.error(error)
      toast.error("Произошла ошибка при удалении голосования.")
    }
  }

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)

  const handleStartPoll = async () => {
    try {
      const pollsResult = await supabase
        .from("polls")
        .select("*")
        .throwOnError()

      const polls =
        pollsResult.data as Database["ovk"]["Tables"]["polls"]["Row"][]

      const allActivePolls = polls?.filter(
        (poll) => !poll.is_finished && poll.start_at && poll.end_at
      )

      if (allActivePolls?.length > 1) {
        toast.error("Нельзя запустить больше одного голосования одновременно.")
        return
      }

      if (
        allActivePolls.length == 1 &&
        allActivePolls[0].id != row.getValue("id")
      ) {
        toast.error(
          "Уже запущено другое голосование. Остановите или удалите его, чтобы запустить это."
        )
        return
      }

      if (
        allActivePolls.length == 1 &&
        allActivePolls[0].id == row.getValue("id")
      ) {
        toast.error(
          "Это голосование уже было запущено. Используйте интерфейс для обновления таймера или создайте новое голосование."
        )
        return
      }

      if (row.getValue("is_finished")) {
        toast.error(
          "Это голосование уже завершено. Создайте новое голосование."
        )
        return
      }

      const startDurationInSeconds = row.getValue("duration") as number
      const endAt = new Date()
      endAt.setSeconds(endAt.getSeconds() + startDurationInSeconds)

      await supabase
        .from("polls")
        .update({
          start_at: new Date().toISOString(),
          end_at: endAt.toISOString(),
        })
        .match({ id: row.getValue("id") })
        .throwOnError()

      toast.success("Голосование успешно запущено.")
      window.location.reload()
    } catch (error: any) {
      toast.error("Произошла ошибка при старте голосования")
    }
  }

  const handleStopPoll = async () => {
    try {
      if (row.getValue("is_finished")) {
        toast.error("Это голосование уже завершено.")
        return
      }

      if (!row.getValue("start_at") || !row.getValue("end_at")) {
        toast.error("Это голосование еще не было запущено.")
        return
      }

      await supabase
        .from("polls")
        .update({
          end_at: new Date().toISOString(),
        })
        .match({ id: row.getValue("id") })
        .throwOnError()

      toast.success("Голосование успешно остановлено.")
      window.location.reload()
    } catch (error: any) {
      toast.error("Произошла ошибка при остановке голосования")
    }
  }

  const handleFinishPoll = async () => {
    if (
      confirm(
        "Подвести итоги? После этого нельзя будет добавить время голосованию?"
      )
    ) {
      await supabase
        .from("polls")
        .update({ is_finished: true })
        .eq("id", row.getValue("id"))
      window.location.reload()
    }
  }

  return (
    <>
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
          <DropdownMenuItem onClick={() => handleStartPoll()}>
            Старт
            <DropdownMenuShortcut>
              <PlayIcon className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleStopPoll()}>
            Стоп
            <DropdownMenuShortcut>
              <StopCircleIcon className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleFinishPoll()}>
            Подвести итоги
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
            Редактировать
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setCopyDialogOpen(true)}>
            Копия
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDeletePoll}>
            Удалить
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateEventDialog
        poll={row.original as any}
        open={updateDialogOpen}
        setOpen={setUpdateDialogOpen}
      />
      <CopyPollDialog
        poll={row.original as any}
        open={copyDialogOpen}
        setOpen={setCopyDialogOpen}
      />
    </>
  )
}
