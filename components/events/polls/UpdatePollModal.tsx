import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  appwritePollsCollection,
  appwriteVotingDatabase,
} from "@/constants/constants"
import { useAppwrite } from "@/context/AppwriteContext"
import { usePoll } from "@/context/PollContext"
import { Account, Databases } from "appwrite"
import { toast } from "react-hot-toast"

import fetchJson from "@/lib/fetchJson"
import { isValidPoll } from "@/lib/isValidPoll"
import { PollDocument } from "@/lib/models/PollDocument"
import PollFormForModal from "@/components/events/polls/PollFormForModal"
import Modal from "@/components/modal/Modal"

export default function UpdatePollModal() {
  const router = useRouter()
  const { eventID } = router.query
  const { pollIdToUpdate, setPollIdToUpdate } = usePoll()
  const [question, setQuestion] = useState<string>("")
  const [duration, setDuration] = useState<number>(0)
  const [pollOptions, setPollOptions] = useState<string[]>([])
  const [showOnlyVotersCount, setShowOnlyVotersCount] = useState(false)
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)

  useEffect(() => {
    const fetchPoll = async () => {
      const poll = (await databases.getDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollIdToUpdate!
      )) as PollDocument
      setQuestion(poll.question)
      setDuration(poll.duration)
      setPollOptions(poll.poll_options)
      setShowOnlyVotersCount(poll.show_only_voters_count)
    }

    if (pollIdToUpdate !== undefined) {
      fetchPoll().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIdToUpdate])

  async function updatePollInDatabase() {
    if (!isValidPoll(question, duration, pollOptions)) {
      return
    }
    const jwt = (await account.createJWT()).jwt
    await fetchJson("/api/polls/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        duration,
        pollOptions,
        eventID,
        pollID: pollIdToUpdate,
        isFinished: false,
        showOnlyVotersCount,
        jwt,
      }),
    })
    setPollIdToUpdate(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToUpdate !== undefined}
      onAccept={updatePollInDatabase}
      acceptButtonName="Изменить"
      onCancel={() => setPollIdToUpdate(undefined)}
      title="Изменить голосование"
    >
      <PollFormForModal
        question={question || ""}
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
