import { useEffect, useState } from "react"
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
import { PollDocument } from "@/lib/models/PollDocument"
import Modal from "@/components/modal/Modal"

export default function CopyPollModal() {
  const { pollIdToCopy, setPollIdToCopy } = usePoll()
  const router = useRouter()
  const { eventID } = router.query
  const [question, setQuestion] = useState<string>()
  const [duration, setDuration] = useState(0)
  const [showOnlyVotersCount, setshowOnlyVotersCount] = useState(false)
  const [pollOptions, setPollOptions] = useState<string[]>([])
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)

  useEffect(() => {
    const fetchPoll = async () => {
      const poll = (await databases.getDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollIdToCopy!
      )) as PollDocument
      setQuestion(poll.question)
      setDuration(poll.duration)
      setPollOptions(poll.poll_options)
      setshowOnlyVotersCount(poll.show_only_voters_count)
    }

    if (pollIdToCopy !== undefined) {
      fetchPoll().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIdToCopy])
  async function copyPoll() {
    const jwt = (await account.createJWT()).jwt
    await fetchJson("/api/polls/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question + " (копия)",
        startAt: null,
        endAt: null,
        duration,
        pollOptions: pollOptions,
        eventID: eventID,
        showOnlyVotersCount: showOnlyVotersCount,
        jwt,
      }),
    })

    setPollIdToCopy(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToCopy !== undefined}
      onAccept={copyPoll}
      acceptButtonName="Скопировать"
      onCancel={() => setPollIdToCopy(undefined)}
      title="Скопировать голосование"
    />
  )
}
