import { Databases, Query } from 'appwrite'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import {
  appwriteEventsCollection,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { EventDocument } from '@/lib/models/EventDocument'

export default function ResetVotesPollModal() {
  const { pollIdToResetVotes, setPollIdToResetVotes } = usePoll()
  const router = useRouter()
  const { eventID } = router.query
  const { client } = useAppwrite()
  const [event, setEvent] = useState<EventDocument>()
  const databases = new Databases(client)

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
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function deletePollVotesFromDatabase() {
    const response = await databases.listDocuments(
      appwriteVotingDatabase,
      appwriteVotesCollection,
      [Query.limit(appwriteListVotesLimit), Query.equal('poll_id', pollIdToResetVotes!)],
    )
    const votes = response.documents

    for (const vote of votes) {
      if (vote.poll_id == pollIdToResetVotes) {
        console.log('deleting vote: ', vote)
        await databases.deleteDocument(appwriteVotingDatabase, appwriteVotesCollection, vote.$id)
      }
    }

    setPollIdToResetVotes(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToResetVotes !== undefined}
      onAccept={deletePollVotesFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setPollIdToResetVotes(undefined)}
      title='Удалить все голоса'
    />
  )
}
