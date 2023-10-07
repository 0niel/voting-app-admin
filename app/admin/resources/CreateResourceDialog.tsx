'use client'

import 'react-datepicker/dist/react-datepicker.css'

import { zodResolver } from '@hookform/resolvers/zod'
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

import CreateOrUpdateResourceForm from './CreateOrUpdateResourceForm'

const schema = z.object({
  name: z.string().min(1, 'Название не может быть пустым'),
  svg_icon: z.string().min(1, 'Иконка не может быть пустой'),
  url: z.string().url('Введите корректную ссылку'),
  event_id: z.number().int('Выберите мероприятие'),
})

type SchemaValues = z.infer<typeof schema>

export default function CreateResourceDialogButton({
  events,
}: {
  events: Database['ovk']['Tables']['events']['Row'][]
}) {
  const [open, setOpen] = useState(false)

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

        <CreateOrUpdateResourceForm />

        <DialogFooter>
          <Button type='submit'>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
