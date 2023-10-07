'use client'
import 'react-datepicker/dist/react-datepicker.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Search } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormMode } from '@/lib/FormMode'
import { PollDisplayMode } from '@/lib/PollDisplayMode'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

const initialPollOptions = ['За', 'Против', 'Воздержусь']
const initialDuration = 180

const schema = z.object({
  question: z.string().min(1, 'Вопрос не может быть пустым').max(255, 'Вопрос слишком длинный'),
  display_mode: z
    .string({ required_error: 'Режим отображения не выбран' })
    .refine((value) => Object.values(PollDisplayMode).includes(value as PollDisplayMode), {
      message: 'Режим отображения не выбран',
    }),
  duration: z
    .number({ invalid_type_error: 'Длительность должна быть числом' })
    .positive('Длительность должна быть положительным числом')
    .optional(),
  event_id: z.number().positive('Мероприятие не выбрано'),
  answer_options: z.array(z.string()).min(1, 'Варианты ответов не могут быть пустыми'),
})

type SchemaValues = z.infer<typeof schema>

export default function CreateOrUpdatePollForm({
  poll = null,
  formMode = FormMode.create,
}: {
  poll?: Database['ovk']['Tables']['polls']['Row'] | null
  formMode?: FormMode
}) {
  const { supabase } = useSupabase()
  const { eventId } = useParams()

  const defaultValues = {
    question: poll?.question ?? '',
    display_mode: poll?.display_mode ?? PollDisplayMode.default,
    event_id: poll?.event_id ?? parseInt(eventId as string),
    duration: poll?.duration ?? initialDuration,

    answer_options: initialPollOptions,
  }

  const form = useForm<SchemaValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const { data: answerOptions, isLoading } = useQuery(
    [poll],
    async () => {
      if (!poll) {
        return null
      }

      const { data } = await supabase
        .from('answer_options')
        .select('*')
        .eq('poll_id', poll.id)
        .throwOnError()

      const options = data as Database['ovk']['Tables']['answer_options']['Row'][]

      form.setValue(
        'answer_options',
        options?.map((option) => option.text),
      )

      return options
    },
    {
      enabled: !!poll,
      onError: (error) => {
        toast.error('Произошла ошибка при загрузке вариантов ответов.')
      },
    },
  )

  const createPoll = async (data: SchemaValues) => {
    try {
      const dataInsert = { ...data, answer_options: undefined }
      const poll = await supabase.from('polls').insert(dataInsert).select().single().throwOnError()

      if (!poll.data?.id) {
        throw new Error('Не удалось создать голосование.')
      }

      const answerOptionsToInsert = data.answer_options.map((option) => ({
        text: option,
        poll_id: poll.data?.id,
      }))

      await supabase.from('answer_options').insert(answerOptionsToInsert).throwOnError()

      toast.success('Голосование успешно создано.')
      window.location.reload()
    } catch (error: any) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message)
      } else {
        toast.error('Произошла ошибка при создании голосования.')
      }
    }
  }

  const updatePoll = async (data: SchemaValues) => {
    try {
      if (!poll) {
        return toast.error('Произошла ошибка при обновлении голосования.')
      }

      await supabase
        .from('polls')
        .update({
          question: data.question,
          display_mode: data.display_mode,
          duration: data.duration,
        })
        .eq('id', poll?.id)
        .throwOnError()

      answerOptions?.forEach(async (option) => {
        const answerOption = data.answer_options.find((el) => el == option.text)
        if (!answerOption) {
          await supabase.from('answer_options').delete().eq('id', option.id).throwOnError()
        }
      })

      data.answer_options.forEach(async (option, index) => {
        const answerOption = answerOptions?.find((el) => el.text === option)
        if (!answerOption) {
          await supabase

            .from('answer_options')
            .insert({ text: option, poll_id: poll?.id })
            .throwOnError()
        }
      })

      toast.success('Голосование успешно обновлено.')
      window.location.reload()
    } catch (error: any) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message)
      } else {
        toast.error('Произошла ошибка при обновлении голосования.')
      }
    }
  }

  const onSubmit = async (data: SchemaValues) => {
    if (formMode === FormMode.edit) {
      await updatePoll(data)
    } else {
      await createPoll(data)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <DialogHeader>
          <DialogTitle>
            {formMode === FormMode.create && 'Создание нового голосования'}
            {formMode === FormMode.edit && 'Редактирование голосования'}
            {formMode === FormMode.copy && 'Копирование голосования'}
          </DialogTitle>
        </DialogHeader>

        {poll && isLoading && <p>Загрузка...</p>}

        {(!poll || !isLoading) && (
          <>
            <FormField
              control={form.control}
              name='question'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Вопрос</FormLabel>
                  <FormControl>
                    <Input placeholder='Захватить РАНХиГС дронами?' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Длительность голосования (в секундах)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='180'
                      onChange={(e) => {
                        try {
                          const duration = parseInt(e.target.value)
                          field.onChange(duration)
                        } catch (error) {
                          field.onChange(initialDuration)
                        }
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='display_mode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Режим отображения</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите режим отображения' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PollDisplayMode.default}>По умолчанию</SelectItem>
                      <SelectItem value={PollDisplayMode.only_votes_count}>
                        Только кол-во проголосовавших
                      </SelectItem>
                      <SelectItem value={PollDisplayMode.show_voters}>
                        Открытое голосование
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === PollDisplayMode.default &&
                      'Показывает количество голосов за каждый вариант ответа.'}
                    {field.value === PollDisplayMode.only_votes_count &&
                      'Не показывает кол-во голосов за вариант ответа, но показывает количество проголосовавших в общем.'}
                    {field.value === PollDisplayMode.show_voters &&
                      'Открытое голосование. Показывает не только голоса за вариант ответов, но и кто проголосовал.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='answer_options'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Варианты ответа</FormLabel>
                    {field.value.map((option, index) => (
                      <div className='flex items-center space-x-2' key={index}>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const options = [...field.value]
                            options[index] = e.target.value
                            field.onChange(options)
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => {
                            const options = [...field.value]
                            options.splice(index, 1)
                            field.onChange(options)
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        const options = [...field.value]
                        options.push('')
                        field.onChange(options)
                      }}
                    >
                      Добавить
                    </Button>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <DialogFooter>
              <Button type='submit'>Сохранить</Button>
            </DialogFooter>
          </>
        )}
      </form>
    </Form>
  )
}
