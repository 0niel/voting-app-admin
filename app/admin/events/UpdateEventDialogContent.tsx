'use client'

import 'react-datepicker/dist/react-datepicker.css'
import React, { useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'

import { Input } from '@/components/ui/input'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function UpdateEventDialogContent({
  event,
}: {
  event: Database['ovk']['Tables']['events']['Row']
}) {
  const [eventToUpdate, setEventToUpdate] = useState(event)

  const { supabase } = useSupabase()

  const handleUpdateEvent = async () => {
    if (eventToUpdate.name.length === 0) {
      toast.error('Введите название мероприятия.')
      return
    }
    if (!eventToUpdate.start_at) {
      toast.error('Введите дату начала мероприятия.')
      return
    }

    try {
      await supabase
        .from('events')
        .update({
          name: eventToUpdate.name,
          start_at: eventToUpdate.start_at,
          is_active: eventToUpdate.is_active,
        })
        .match({ id: event.id })
        .throwOnError()

      toast.success('Мероприятие успешно обновлено.')
      window.location.reload()
    } catch (error: any) {
      toast.error('Произошла ошибка при обновлении мероприятия.')
    }
  }

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование мероприятия</DialogTitle>
        </DialogHeader>

        <div className='space-y-2'>
          <Label htmlFor='name'>Имя</Label>
          <Input
            id='name'
            type='text'
            placeholder={eventToUpdate.name}
            value={eventToUpdate.name}
            onChange={(e) => setEventToUpdate({ ...eventToUpdate, name: e.target.value })}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='start_at'>Дата начала</Label>
          <div>
            <ReactDatePicker
              id='start_at'
              selected={new Date(eventToUpdate.start_at)}
              onChange={(date) =>
                date && setEventToUpdate({ ...eventToUpdate, start_at: date.toISOString() })
              }
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={5}
              timeCaption='Время'
              dateFormat='dd.MM.yyyy HH:mm'
              className='border-base-200 text-neutral block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 p-2.5 text-sm focus:border-secondary focus:ring-secondary'
              locale='ru'
            />
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='is_active'
            checked={eventToUpdate.is_active}
            onCheckedChange={() =>
              setEventToUpdate({ ...eventToUpdate, is_active: !eventToUpdate.is_active })
            }
          />
          <Label htmlFor='is_active'>Активно?</Label>
        </div>

        <DialogFooter>
          <Button type='submit' onClick={handleUpdateEvent}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  )
}
