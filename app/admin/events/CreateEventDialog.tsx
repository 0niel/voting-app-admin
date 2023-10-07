import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Database } from '@/lib/supabase/db-types'

import CreateOrUpdateEventForm from './CreateOrUpdateEventForm'

export default function CreateEventDialogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создать</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание мероприятия</DialogTitle>
        </DialogHeader>
        <CreateOrUpdateEventForm />
      </DialogContent>
    </Dialog>
  )
}
