import React, { createContext, useState } from "react"

interface EventContextI {
  createEvent: boolean
  setCreateEvent: Function
  eventIdToUpdate?: string
  setEventIdToUpdate: Function
  eventIdToDelete?: string
  setEventIdToDelete: Function
}

const EventContext = createContext<EventContextI>({
  createEvent: false,
  setCreateEvent: (_open: boolean) => null,
  eventIdToUpdate: undefined,
  setEventIdToUpdate: (_eventId: string) => null,
  eventIdToDelete: undefined,
  setEventIdToDelete: (_eventId: string) => null,
})

export const useEvent = () => React.useContext(EventContext)

export function EventProvider({ children }: any) {
  const [createEvent, setCreateEvent] = useState<boolean>(false)
  const [eventIdToUpdate, setEventIdToUpdate] = useState<string | undefined>(
    undefined
  )
  const [eventIdToDelete, setEventIdToDelete] = useState<string | undefined>(
    undefined
  )

  return (
    <EventContext.Provider
      value={{
        createEvent,
        setCreateEvent,
        eventIdToUpdate,
        setEventIdToUpdate,
        eventIdToDelete,
        setEventIdToDelete,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}
