'use client'
import 'react-datepicker/dist/react-datepicker.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { useForm } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
import { FormMode } from '@/lib/FormMode'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

const schema = z.object({
  name: z.string().min(1, 'Название не может быть пустым'),
  start_at: z.string().min(1, 'Дата начала не может быть пустой'),
  is_active: z.boolean(),
  logo_url: z.string().url('Загрузите логотип мероприятия'),
})

type SchemaValues = z.infer<typeof schema>

export default function CreateOrUpdateEventForm({
  event = null,
  formMode = FormMode.create,
}: {
  event?: Database['ovk']['Tables']['events']['Row'] | null
  formMode?: FormMode
}) {
  const { supabase } = useSupabase()

  const defaultValues = {
    name: event?.name ?? '',
    start_at: event?.start_at ? new Date(event.start_at).toISOString() : '',
    is_active: event?.is_active ?? false,
    logo_url: event?.logo_url ?? '',
  }

  const form = useForm<SchemaValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const createEvent = async (data: SchemaValues) => {
    try {
      await supabase.schema('ovk').from('events').insert(data).throwOnError()

      toast.success('Мероприятие успешно создано.')
      window.location.reload()
    } catch (error: any) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message)
      } else {
        toast.error('Произошла ошибка при создании мероприятия.')
      }
    }
  }

  const updateEvent = async (data: SchemaValues) => {
    try {
      if (!event) {
        return toast.error('Произошла ошибка при обновлении мероприятия.')
      }

      await supabase.schema('ovk').from('events').update(data).eq('id', event?.id).throwOnError()

      toast.success('Мероприяте успешно обновлено.')
      window.location.reload()
    } catch (error: any) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message)
      } else {
        toast.error('Произошла ошибка при обновлении мероприятия.')
      }
    }
  }

  const onSubmit = async (data: SchemaValues) => {
    if (formMode === FormMode.edit) {
      await updateEvent(data)
    } else {
      await createEvent(data)
    }
  }

  const [uploading, setUploading] = useState(false)

  async function downloadImage(path: string) {
    const { data } = await supabase.storage.from('ovk').getPublicUrl(path)
    if (!data) {
      return null
    }
    return data.publicUrl
  }

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Вы должны выбрать хотя бы одно изображение.')
      }

      const uid = uuid()

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      let { error: uploadError, data } = await supabase.storage.from('ovk').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      if (data) {
        return await downloadImage(data?.path)
      }
    } catch (error) {
      toast.error('Произошла ошибка при загрузке изображения')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder='ОВК ИИТ' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='logo_url'
          render={({ field }) => (
            <FormItem>
              {field.value && (
                <Avatar className='h-24 w-24'>
                  <AvatarImage src={field.value} />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
              )}
              <FormLabel>Загрузите логотип</FormLabel>
              <FormControl>
                <Input
                  id='picture'
                  type='file'
                  accept='image/*'
                  onChange={async (event) => {
                    const url = await uploadLogo(event)
                    if (url) {
                      field.onChange(url)
                    }
                  }}
                  disabled={uploading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='start_at'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата начала</FormLabel>
              <FormControl>
                <ReactDatePicker
                  id='start_at'
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => date && field.onChange(date.toISOString())}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={5}
                  timeCaption='Время'
                  dateFormat='dd.MM.yyyy HH:mm'
                  className='border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary'
                  locale='ru'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='is_active'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-2'>
              <FormLabel>Активно?</FormLabel>
              <FormControl>
                <Switch
                  className='m-0'
                  id='is_active'
                  checked={field.value}
                  onCheckedChange={() => field.onChange(!field.value)}
                />
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
