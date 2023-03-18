import { Account, Databases } from 'appwrite'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwritePollsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import fetchJson from '@/lib/fetchJson'
import { PollDocument } from '@/lib/models/PollDocument'

export default function CopyPollModal() {
  const { pollIdToCopy, setPollIdToCopy } = usePoll()
  const router = useRouter()
  const { eventID } = router.query
  const [question, setQuestion] = useState<string>()
  const [startDate, setStartDate] = useState<Date>()
  const [finishDate, setFinishDate] = useState<Date>()
  const [duration, setDuration] = useState(0)
  const [pollOptions, setPollOptions] = useState<string[]>([])
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)

  useEffect(() => {
    const fetchPoll = async () => {
      const poll = (await databases.getDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollIdToCopy!,
      )) as PollDocument
      setQuestion(poll.question)
      setDuration(poll.duration)
      setStartDate(poll.start_at ? new Date(poll.start_at) : undefined)
      setFinishDate(poll.end_at ? new Date(poll.end_at) : undefined)
      setPollOptions(poll.poll_options)
    }

    if (pollIdToCopy !== undefined) {
      fetchPoll().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIdToCopy])
  async function copyPoll() {
    const jwt = (await account.createJWT()).jwt
    await fetchJson('/api/polls/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question + ' (копия)',
        startAt: startDate && startDate.toISOString(),
        endAt: finishDate && finishDate.toISOString(),
        duration,
        pollOptions: pollOptions,
        eventID: eventID,
        jwt,
      }),
    })

    setPollIdToCopy(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToCopy !== undefined}
      onAccept={copyPoll}
      acceptButtonName='Скопировать'
      onCancel={() => setPollIdToCopy(undefined)}
      title='Скопировать голосование'
    />
  )
}
