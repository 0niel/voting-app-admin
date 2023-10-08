"use client"

import "react-datepicker/dist/react-datepicker.css"
import React, { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { toast } from "react-hot-toast"

import { useSupabase } from "@/lib/supabase/supabase-provider"
import { UserToView } from "@/lib/supabase/supabase-server"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function CreateAccessModeratorDialogButton({
  users,
  eventId,
}: {
  users: UserToView[]
  eventId: number
}) {
  const { supabase } = useSupabase()

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")

  const handleAddMember = async () => {
    const user = users.find((user) => user.email === email)
    if (!user) {
      toast.error("Выберите существующего пользователя")
      return
    }

    try {
      await supabase
        .from("users_permissions")
        .upsert({
          user_id: user.id,
          event_id: eventId,
          is_access_moderator: true,
        })
        .throwOnError()

      toast.success("Пользователь успешно добавлен в модераторы доступа.")
      window.location.reload()
    } catch (error: any) {
      toast.error(
        "Не удалось добавить пользователя в модераторы доступа. Возможно, он уже находится в списке модераторов доступа."
      )
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Назначение</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначить модератором доступа</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                <span className="truncate">{email}</span>

                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Поиск..." />
                <CommandEmpty>Не найдено.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        if (!user.email) return
                        setEmail(user.email)
                        setOpen(false)
                      }}
                    >
                      {user.email}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddMember}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
