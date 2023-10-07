'use client'

'use client'

import 'react-datepicker/dist/react-datepicker.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z, ZodError } from 'zod'

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

const schema = z.object({
  name: z.string().min(1, 'Название не может быть пустым'),
  svg_icon: z.string().min(1, 'Иконка не может быть пустой'),
  url: z.string().url('Введите корректную ссылку'),
  event_id: z.number().int().positive('Выберите мероприятие'),
})

type SchemaValues = z.infer<typeof schema>

export default function CreateResourceDialogButton({
  resource = null,
  update = false,
}: {
  resource?: Database['ovk']['Tables']['resources']['Row'] | null
  update?: boolean
}) {
  const { supabase } = useSupabase()

  const [open, setOpen] = useState(false)

  const [defaultValues, setDefaultValues] = useState<SchemaValues>({
    name: resource?.name ?? '',
    url: resource?.url ?? '',
    svg_icon: resource?.svg_icon ?? '',
    event_id: resource?.event_id ?? -1,
  })

  const { data: events } = useQuery([resource], async () => {
    const { data } = await supabase.from('events').select('*').throwOnError()

    if (!data) return

    setDefaultValues((prev) => ({
      ...prev,
      event_id: data[0].id,
    }))

    return data
  })
  const form = useForm<SchemaValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const createResource = async (data: SchemaValues) => {
    try {
      await supabase.schema('ovk').from('resources').insert(data).throwOnError()

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

  const updateResource = async (data: SchemaValues) => {
    try {
      if (!resource) {
        return toast.error('Произошла ошибка при обновлении ресурса.')
      }

      await supabase
        .schema('ovk')
        .from('resources')
        .update(data)
        .eq('id', resource?.id)
        .throwOnError()

      toast.success('Ресурс успешно обновлен.')
      window.location.reload()
    } catch (error: any) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message)
      } else {
        toast.error('Произошла ошибка при обновлении ресурса.')
      }
    }
  }

  const onSubmit = async (data: SchemaValues) => {
    if (update) {
      await updateResource(data)
    } else {
      await createResource(data)
    }
  }

  const feather = require('feather-icons')
  const iconNames = Object.keys(feather.icons)
  const [iconName, setIconName] = useState('')
  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(iconName.toLowerCase()),
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <DialogHeader>
          <DialogTitle>Создание нового ресуса</DialogTitle>
        </DialogHeader>

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder='Какой-то там документ' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка</FormLabel>
              <FormControl>
                <Input placeholder='https://ovk.iit' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='svg_icon'
          render={({ field }) => (
            <FormItem>
              <Label htmlFor='icon-name'>Поиск иконки</Label>
              <Input
                id='icon-name'
                value={iconName}
                onChange={(event) => {
                  setIconName(event.target.value)
                }}
              />

              <FormLabel>SVG иконка</FormLabel>
              <FormControl>
                <ScrollArea className='mt-2 h-72 w-full rounded-md border'>
                  <div className='grid grid-cols-4 gap-2'>
                    {filteredIcons.map((name) => (
                      <div
                        key={name}
                        className={`${
                          field.value === name ? 'border bg-gray-300' : 'text-neutral bg-gray-50'
                        } flex cursor-pointer flex-col items-center justify-center rounded-lg p-2.5`}
                        onClick={() => field.onChange(name)}
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
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='event_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Мероприятие</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={open}
                      className='w-full justify-between'
                    >
                      <span className='truncate'>{field.value}</span>

                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className='max-w-72 p-0'>
                    <Command>
                      <CommandInput placeholder='Мероприятие' />
                      <CommandEmpty>Не найдено.</CommandEmpty>
                      <CommandGroup>
                        {events?.map((event) => (
                          <CommandItem
                            key={event.id}
                            onSelect={() => {
                              if (!event.name) return
                              field.onChange(event.id)
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
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type='submit'>Сохранить</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
