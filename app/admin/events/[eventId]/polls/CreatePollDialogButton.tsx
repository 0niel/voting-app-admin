'use client'

import 'react-datepicker/dist/react-datepicker.css'

import { ChevronsUpDown, Search } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'
import { v4 as uuid } from 'uuid'
import { z, ZodError } from 'zod'

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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { UserToView } from '@/lib/supabase/supabase-server'

type Resource = Omit<Database['ovk']['Tables']['resources']['Row'], 'id' | 'created_at'>

const schema = z.object({
  name: z.string().min(1, 'Название не может быть пустым'),
  svg_icon: z.string().min(1, 'Иконка не может быть пустой'),
  url: z.string().min(1, 'Ссылка не может быть пустой'),
  event_id: z.number().int('Выберите мероприятие'),
})

export default function CreatePollDialogButton({
  events,
}: {
  events: Database['ovk']['Tables']['events']['Row'][]
}) {
  const { supabase } = useSupabase()

  const [open, setOpen] = useState(false)
  const [resource, setResource] = useState<Resource>({
    name: '',
    svg_icon: '',
    url: '',
    event_id: events[0]?.id ?? '',
  })

  const handleCreateResource = async () => {
    try {
      const resourceToCreate = schema.parse(resource)
      await supabase.from('resources').insert(resourceToCreate).throwOnError()

      toast.success('Ресурс успешно создан.')
      window.location.reload()
    } catch (error: any) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message)
      } else {
        toast.error('Произошла ошибка при создании ресурса.')
      }
    }
  }

  const feather = require('feather-icons')
  const iconNames = Object.keys(feather.icons)
  const [iconName, setIconName] = useState('')
  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(iconName.toLowerCase()),
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создание ресурса</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание нового ресуса</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <div>
            <Label htmlFor='name'>Название</Label>
            <Input
              id='name'
              value={resource.name}
              onChange={(event) => {
                setResource((prev) => ({ ...prev, name: event.target.value }))
              }}
            />
          </div>
          <div>
            <Label htmlFor='url'>Ссылка</Label>
            <Input
              id='url'
              value={resource.url}
              onChange={(event) => {
                setResource((prev) => ({ ...prev, url: event.target.value }))
              }}
            />
          </div>
          <div className='mt-4'>
            <Label htmlFor='icon-name'>Поиск иконки</Label>
            <Input
              id='icon-name'
              value={iconName}
              onChange={(event) => {
                setIconName(event.target.value)
              }}
            />
            <ScrollArea className='mt-2 h-72 w-full rounded-md border'>
              <div className='grid grid-cols-4 gap-2'>
                {filteredIcons.map((name) => (
                  <div
                    key={name}
                    className={`${
                      name === resource.svg_icon ? 'border bg-gray-300' : 'text-neutral bg-gray-50'
                    } flex cursor-pointer flex-col items-center justify-center rounded-lg p-2.5`}
                    onClick={() => setResource((prev) => ({ ...prev, svg_icon: name }))}
                  >
                    <div
                      className='h-8 w-8'
                      dangerouslySetInnerHTML={{
                        __html: feather.icons[name].toSvg({
                          class: 'w-full h-full',
                        }),
                      }}
                    />
                    <div className='text-xs'>{name}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={open}
                  className='w-full justify-between'
                >
                  <span className='truncate'>{resource.event_id}</span>

                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='max-w-72 p-0'>
                <Command>
                  <CommandInput placeholder='Мероприятие' />
                  <CommandEmpty>Не найдено.</CommandEmpty>
                  <CommandGroup>
                    {events.map((event) => (
                      <CommandItem
                        key={event.id}
                        onSelect={() => {
                          if (!event.name) return
                          setResource((prev) => ({ ...prev, event_id: event.id }))
                          setOpen(false)
                        }}
                      >
                        {event.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button type='submit' onClick={handleCreateResource}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
