import React, { createContext, useState } from 'react'

interface PollContextI {
  createPoll?: boolean
  setCreatePoll: Function
  pollIdToDelete?: string
  setPollIdToDelete: Function
}

const PollContext = createContext<PollContextI>({
  createPoll: false,
  setCreatePoll: (_eventId: boolean) => null,
  pollIdToDelete: undefined,
  setPollIdToDelete: (_pollId: string) => null,
})

export const usePoll = () => React.useContext(PollContext)

export function PollProvider({ children }: any) {
  const [createPoll, setCreatePoll] = useState<boolean>(false)
  const [pollIdToDelete, setPollIdToDelete] = useState<string | undefined>(undefined)

  return (
    <PollContext.Provider value={{ createPoll, setCreatePoll, pollIdToDelete, setPollIdToDelete }}>
      {children}
    </PollContext.Provider>
  )
}
