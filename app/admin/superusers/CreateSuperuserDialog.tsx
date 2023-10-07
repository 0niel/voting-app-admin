'use client'

import 'react-datepicker/dist/react-datepicker.css'

import { ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'
import { v4 as uuid } from 'uuid'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { UserToView } from '@/lib/supabase/supabase-server'

export default function CreateSuperuserDialogButton({ users }: { users: UserToView[] }) {
  const { supabase } = useSupabase()

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')

  const handleCreateSuperuser = async () => {
    const user = users.find((user) => user.email === email)
    if (!user) {
      toast.error('Выберите существующего пользователя')
      return
    }

    try {
      await supabase
        .from('superusers')
        .insert({
          user_id: user.id,
        })
        .throwOnError()

      toast.success('Пользователь успешно назначен суперпользователем.')
      window.location.reload()
    } catch (error: any) {
      toast.error(
        'Не удалось назначить пользователя суперпользователем. Возможно, он уже им является.',
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
          <DialogTitle>Назначить супепользователем</DialogTitle>
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
          <Button type='submit' onClick={handleCreateSuperuser}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
