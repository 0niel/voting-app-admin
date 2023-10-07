'use client'

import 'react-datepicker/dist/react-datepicker.css'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'
import { v4 as uuid } from 'uuid'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Database } from '@/lib/supabase/db-types'
import { useSupabase } from '@/lib/supabase/supabase-provider'

type Events = Database['ovk']['Tables']['events']['Row']

export default function CreateEventDialogButton() {
  const { supabase } = useSupabase()

  const [logoUrl, setLogoUrl] = useState<Events['logo_url']>()
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [startAt, setStartAt] = useState<Date | null>(null)
  const [isActive, setIsActive] = useState(false)

  const handleUpdateEvent = async () => {
    if (name.length < 3) {
      toast.error('Введите название мероприятия')
      return
    }
    if (!startAt) {
      toast.error('Введите дату начала мероприятия')
      return
    }
    if (!logoUrl) {
      toast.error('Загрузите логотип мероприятия')
      return
    }

    try {
      await supabase
        .from('events')
        .insert({
          name: name,
          start_at: startAt.toISOString(),
          is_active: isActive,
          logo_url: logoUrl,
        })
        .throwOnError()

      toast.success('Мероприятие успешно создано.')
      window.location.reload()
    } catch (error: any) {
      toast.error('Произошла ошибка при создании мероприятия.')
    }
  }

  async function downloadImage(path: string) {
    const { data } = await supabase.storage.from('ovk').getPublicUrl(path)
    if (!data) {
      return
    }
    setLogoUrl(data.publicUrl)
  }

  const uploadLogo: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
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

      if (data) downloadImage(data?.path)
    } catch (error) {
      toast.error('Произошла ошибка при загрузке изображения')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создать</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание мероприятия</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          {logoUrl && (
            <Avatar className='h-24 w-24'>
              <AvatarImage src={logoUrl} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          )}

          <div>
            <Label htmlFor='picture'>Выберите логотип</Label>
            <Input
              id='picture'
              type='file'
              accept='image/*'
              onChange={uploadLogo}
              disabled={uploading}
            />
          </div>

          <div>
            <Label htmlFor='name'>Имя</Label>
            <Input
              id='name'
              type='text'
              placeholder={name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='start_at'>Дата начала</Label>
            <div>
              <ReactDatePicker
                id='start_at'
                selected={startAt}
                onChange={(date) => date && setStartAt(date)}
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
              checked={isActive}
              onCheckedChange={() => setIsActive(!isActive)}
            />
            <Label htmlFor='is_active'>Активно?</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type='submit' onClick={handleUpdateEvent}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
