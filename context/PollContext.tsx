import React, { createContext, useState } from 'react'

interface PollContextI {
  createPoll?: boolean
  setCreatePoll: Function
  pollIdToUpdate?: string
  setPollIdToUpdate: Function
  pollIdToDelete?: string
  setPollIdToDelete: Function
  pollIdToResetVotes?: string
  setPollIdToResetVotes: Function
  pollIdToCopy?: string
  setPollIdToCopy: Function
  pollIdToShowResults?: string
  setPollIdToShowResults: Function
}

const PollContext = createContext<PollContextI>({
  createPoll: false,
  setCreatePoll: (_eventId: boolean) => null,
  pollIdToUpdate: undefined,
  setPollIdToUpdate: (_pollId: string) => null,
  pollIdToDelete: undefined,
  setPollIdToDelete: (_pollId: string) => null,
  pollIdToResetVotes: undefined,
  setPollIdToResetVotes: (_pollId: string) => null,
  pollIdToCopy: undefined,
  setPollIdToCopy: (_pollId: string) => null,
  pollIdToShowResults: undefined,
  setPollIdToShowResults: (_pollId: string) => null,
})

export const usePoll = () => React.useContext(PollContext)

export function PollProvider({ children }: any) {
  const [createPoll, setCreatePoll] = useState<boolean>(false)
  const [pollIdToUpdate, setPollIdToUpdate] = useState<string>()
  const [pollIdToDelete, setPollIdToDelete] = useState<string>()
  const [pollIdToResetVotes, setPollIdToResetVotes] = useState<string>()
  const [pollIdToCopy, setPollIdToCopy] = useState<string>()
  const [pollIdToShowResults, setPollIdToShowResults] = useState<string>()

  return (
    <PollContext.Provider
      value={{
        createPoll,
        setCreatePoll,
        pollIdToUpdate,
        setPollIdToUpdate,
        pollIdToDelete,
        setPollIdToDelete,
        pollIdToResetVotes,
        setPollIdToResetVotes,
        pollIdToCopy,
        setPollIdToCopy,
        pollIdToShowResults,
        setPollIdToShowResults,
      }}
    >
      {children}
    </PollContext.Provider>
  )
}
