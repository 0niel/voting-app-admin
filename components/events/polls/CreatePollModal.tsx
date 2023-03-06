import { Account, Databases } from 'appwrite'
import ru from 'date-fns/locale/ru'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { registerLocale } from 'react-datepicker'
import { toast } from 'react-hot-toast'

import PollFormForModal from '@/components/events/polls/PollFormForModal'
import Modal from '@/components/modal/Modal'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { handleFetchError } from '@/lib/handleFetchError'
import { isValidPoll } from '@/lib/isValidPoll'
import { EventDocument } from '@/lib/models/EventDocument'

export default function CreatePollModal() {
  const initialQuestion = ''
  const initialStartDate = new Date()
  const initialFinishDate = new Date()
  const initialPollOptions = ['да', 'нет']

  const router = useRouter()
  const { client } = useAppwrite()
  const { eventID } = router.query
  const databases = new Databases(client)
  const { createPoll, setCreatePoll } = usePoll()
  const [question, setQuestion] = useState(initialQuestion)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [finishDate, setFinishDate] = useState(initialFinishDate)
  const [pollOptions, setPollOptions] = useState<string[]>(initialPollOptions)
  const [event, setEvent] = useState<EventDocument>()
  const account = new Account(client)

  useEffect(() => {
    setQuestion(initialQuestion)
    setStartDate(initialStartDate)
    setFinishDate(initialFinishDate)
    setPollOptions(initialPollOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPoll])

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event as EventDocument)
    }
    if (router.isReady) {
      registerLocale('ru', ru)
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function addPollToDatabase() {
    if (!isValidPoll(question, startDate, finishDate, pollOptions)) {
      return
    }
    const jwt = (await account.createJWT()).jwt
    fetch('/api/polls/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        startAt: startDate.toISOString(),
        endAt: finishDate.toISOString(),
        pollOptions: pollOptions,
        eventID: event!.$id,
        jwt,
      }),
    }).then(handleFetchError)
    setCreatePoll(false)
  }

  return (
    <Modal
      isOpen={createPoll!}
      onAccept={addPollToDatabase}
      acceptButtonName='Создать'
      onCancel={() => setCreatePoll(false)}
      title='Создать голосование'
    >
      <PollFormForModal
        question={question}
        setQuestion={setQuestion}
        startDate={startDate}
        setStartDate={setStartDate}
        finishDate={finishDate}
        setFinishDate={setFinishDate}
        pollOptions={pollOptions}
        setPollOptions={setPollOptions}
      />
    </Modal>
  )
}
