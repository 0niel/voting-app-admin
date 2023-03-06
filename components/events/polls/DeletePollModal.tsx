import { Databases } from 'appwrite'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import {
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { EventDocument } from '@/lib/models/EventDocument'

export default function DeletePollModal() {
  const { pollIdToDelete, setPollIdToDelete } = usePoll()
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

  async function deletePollFromDatabase() {
    await databases.deleteDocument(appwriteVotingDatabase, appwritePollsCollection, pollIdToDelete!)
    setPollIdToDelete(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToDelete !== undefined}
      onAccept={deletePollFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setPollIdToDelete(undefined)}
      title='Удалить голосование'
    />
  )
}
