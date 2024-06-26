import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteVotingDatabase,
} from "@/constants/constants"
import { useAppwrite } from "@/context/AppwriteContext"
import { usePoll } from "@/context/PollContext"
import { Account, Databases, Query } from "appwrite"
import ru from "date-fns/locale/ru"
import { registerLocale } from "react-datepicker"
import { toast } from "react-hot-toast"

import fetchJson from "@/lib/fetchJson"
import { isValidPoll } from "@/lib/isValidPoll"
import { EventDocument } from "@/lib/models/EventDocument"
import PollFormForModal from "@/components/events/polls/PollFormForModal"
import Modal from "@/components/modal/Modal"

const initialQuestion = ""
const initialPollOptions = ["За", "Против", "Воздержусь"]
const initialDuration = 180
const initialShowOnlyVotersCount = true

export default function CreatePollModal() {
  const router = useRouter()
  const { client } = useAppwrite()
  const { eventID } = router.query
  const databases = new Databases(client)
  const { createPoll, setCreatePoll } = usePoll()
  const [question, setQuestion] = useState(initialQuestion)
  const [duration, setDuration] = useState<number>(initialDuration)
  const [pollOptions, setPollOptions] = useState<string[]>(initialPollOptions)
  const [showOnlyVotersCount, setShowOnlyVotersCount] = useState(
    initialShowOnlyVotersCount
  )
  const [event, setEvent] = useState<EventDocument>()
  const account = new Account(client)

  useEffect(() => {
    setQuestion(initialQuestion)
    setPollOptions(initialPollOptions)
    setDuration(initialDuration)
    setShowOnlyVotersCount(initialShowOnlyVotersCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPoll])

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string
      )
      setEvent(_event as EventDocument)
    }
    if (router.isReady) {
      registerLocale("ru", ru)
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function addPollToDatabase() {
    if (!isValidPoll(question, duration, pollOptions)) {
      return
    }
    const jwt = (await account.createJWT()).jwt
    await fetchJson("/api/polls/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        duration,
        pollOptions: pollOptions,
        eventID: event!.$id,
        showOnlyVotersCount,
        jwt,
      }),
    })
    setCreatePoll(false)
  }

  return (
    <Modal
      isOpen={createPoll!}
      onAccept={addPollToDatabase}
      acceptButtonName="Создать"
      onCancel={() => setCreatePoll(false)}
      title="Создать голосование"
    >
      <PollFormForModal
        question={question}
        setQuestion={setQuestion}
        duration={duration}
        setDuration={setDuration}
        pollOptions={pollOptions}
        setPollOptions={setPollOptions}
        showOnlyVotersCount={showOnlyVotersCount}
        setShowOnlyVotersCount={setShowOnlyVotersCount}
      />
    </Modal>
  )
}
