import { Account, Databases } from 'appwrite'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import PollFormForModal from '@/components/events/polls/PollFormForModal'
import Modal from '@/components/modal/Modal'
import { appwritePollsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import fetchJson from '@/lib/fetchJson'
import { isValidPoll } from '@/lib/isValidPoll'
import { PollDocument } from '@/lib/models/PollDocument'
import useUser from '@/lib/useUser'

export default function UpdatePollModal() {
  const router = useRouter()
  const { eventID } = router.query
  const { user } = useUser()
  const { pollIdToUpdate, setPollIdToUpdate } = usePoll()
  const [question, setQuestion] = useState<string>()
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [finishDate, setFinishDate] = useState<Date>(new Date())
  const [pollOptions, setPollOptions] = useState<string[]>([])
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)

  useEffect(() => {
    const fetchPoll = async () => {
      const poll = (await databases.getDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollIdToUpdate!,
      )) as PollDocument
      setQuestion(poll.question)
      setStartDate(new Date(poll.start_at))
      setFinishDate(new Date(poll.end_at))
      setPollOptions(poll.poll_options)
    }

    if (pollIdToUpdate !== undefined) {
      fetchPoll().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIdToUpdate])

  async function updatePollInDatabase() {
    if (!isValidPoll(question!, startDate!, finishDate!, pollOptions)) {
      return
    }
    const jwt = (await account.createJWT()).jwt
    await fetchJson('/api/polls/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        startAt: startDate.toISOString(),
        endAt: finishDate.toISOString(),
        pollOptions,
        eventID,
        pollID: pollIdToUpdate,
        jwt,
      }),
    })
    setPollIdToUpdate(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToUpdate !== undefined}
      onAccept={updatePollInDatabase}
      acceptButtonName='Изменить'
      onCancel={() => setPollIdToUpdate(undefined)}
      title='Изменить голосование'
    >
      <PollFormForModal
        question={question || ''}
        setQuestion={setQuestion}
        startDate={startDate || new Date()}
        setStartDate={setStartDate}
        finishDate={finishDate || new Date()}
        setFinishDate={setFinishDate}
        pollOptions={pollOptions}
        setPollOptions={setPollOptions}
      />
    </Modal>
  )
}
