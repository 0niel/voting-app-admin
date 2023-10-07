import React, { useState } from 'react'

import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Database } from '@/lib/supabase/db-types'

import CreateOrUpdateEventForm from './CreateOrUpdateEventForm'

export default function UpdateEventDialogContent({
  event,
}: {
  event: Database['ovk']['Tables']['events']['Row']
}) {
  const [eventToUpdate, setEventToUpdate] = useState(event)

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование мероприятия</DialogTitle>
        </DialogHeader>

        <CreateOrUpdateEventForm event={eventToUpdate} update />
      </DialogContent>
    </>
  )
}
