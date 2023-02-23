import React, { createContext, useState } from 'react'
import { Client, Databases, Models } from 'appwrite'

interface UpdateEventContextI {
  eventId?: string
  setEventId: Function
}

const UpdateEventContext = createContext<UpdateEventContextI>({
  eventId: undefined,
  setEventId: (_eventId: string) => null,
})

export const useUpdateEvent = () => React.useContext(UpdateEventContext)

export function UpdateEventProvider({ children }: any) {
  const [eventId, setEventId] = useState<string | undefined>(undefined)

  return (
    <UpdateEventContext.Provider value={{ eventId, setEventId }}>
      {children}
    </UpdateEventContext.Provider>
  )
}
