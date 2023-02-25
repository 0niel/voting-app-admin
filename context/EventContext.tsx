import React, { createContext, useState } from 'react'
import { Client, Databases, Models } from 'appwrite'

interface EventContextI {
  eventIdToUpdate?: string
  setEventIdToUpdate: Function
  eventIdToDelete?: string
  setEventIdToDelete: Function
}

const EventContext = createContext<EventContextI>({
  eventIdToUpdate: undefined,
  setEventIdToUpdate: (_eventId: string) => null,
  eventIdToDelete: undefined,
  setEventIdToDelete: (_eventId: string) => null,
})

export const useEvent = () => React.useContext(EventContext)

export function EventProvider({ children }: any) {
  const [eventIdToUpdate, setEventIdToUpdate] = useState<string | undefined>(undefined)
  const [eventIdToDelete, setEventIdToDelete] = useState<string | undefined>(undefined)

  return (
    <EventContext.Provider
      value={{ eventIdToUpdate, setEventIdToUpdate, eventIdToDelete, setEventIdToDelete }}
    >
      {children}
    </EventContext.Provider>
  )
}
