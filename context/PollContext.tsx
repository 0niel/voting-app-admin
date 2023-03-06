import React, { createContext, useState } from 'react'

interface PollContextI {
  createPoll?: boolean
  setCreatePoll: Function
  pollIdToUpdate?: string
  setPollIdToUpdate: Function
  pollIdToDelete?: string
  setPollIdToDelete: Function
}

const PollContext = createContext<PollContextI>({
  createPoll: false,
  setCreatePoll: (_eventId: boolean) => null,
  pollIdToUpdate: undefined,
  setPollIdToUpdate: (_pollId: string) => null,
  pollIdToDelete: undefined,
  setPollIdToDelete: (_pollId: string) => null,
})

export const usePoll = () => React.useContext(PollContext)

export function PollProvider({ children }: any) {
  const [createPoll, setCreatePoll] = useState<boolean>(false)
  const [pollIdToUpdate, setPollIdToUpdate] = useState<string>()
  const [pollIdToDelete, setPollIdToDelete] = useState<string>()

  return (
    <PollContext.Provider
      value={{
        createPoll,
        setCreatePoll,
        pollIdToUpdate,
        setPollIdToUpdate,
        pollIdToDelete,
        setPollIdToDelete,
      }}
    >
      {children}
    </PollContext.Provider>
  )
}
