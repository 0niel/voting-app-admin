import React, { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormMode } from '@/lib/FormMode'
import { Database } from '@/lib/supabase/db-types'

import CreateOrUpdateEventForm from './Form'

export default function CopyEventDialog({
  event,
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  event: Database['ovk']['Tables']['events']['Row']
}) {
  const [eventToUpdate, setEventToUpdate] = useState(event)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Копирование мероприятия</DialogTitle>
        </DialogHeader>

        <CreateOrUpdateEventForm event={eventToUpdate} formMode={FormMode.copy} />
      </DialogContent>
    </Dialog>
  )
}
