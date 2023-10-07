'use client'
import { ChevronsUpDown } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { UserToView } from '@/lib/supabase/supabase-server'

export default function CreateParticipantDialogButton({
  users,
  eventId,
}: {
  users: UserToView[]
  eventId: number
}) {
  const { supabase } = useSupabase()

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')

  const handleAddMember = async () => {
    const user = users.find((user) => user.email === email)
    if (!user) {
      toast.error('Выберите существующего пользователя')
      return
    }

    try {
      await supabase
        .from('participants')
        .insert({
          user_id: user.id,
          event_id: eventId,
        })
        .throwOnError()

      toast.success('Пользователь успешно добавлен в голосование.')
      window.location.reload()
    } catch (error: any) {
      toast.error(
        'Не удалось добавить пользователя в голосование. Возможно, он уже находится в списке участников.',
      )
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Добавить</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить участника</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-full justify-between'
              >
                <span className='truncate'>{email}</span>

                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='max-w-[400px] p-0'>
              <Command>
                <CommandInput placeholder='Поиск...' />
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
          <Button type='submit' onClick={handleAddMember}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}