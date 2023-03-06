import { Databases, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import { EventDocument } from '@/lib/models/EventDocument'

export default function DeleteVotingModeratorModal() {
  const { membershipIDToDelete, setMembershipIDToDelete } = useMembership()
  const router = useRouter()
  const { eventID } = router.query
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const [event, setEvent] = useState<EventDocument>()
  const teams = new Teams(client)

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

  async function deleteParticipantFromDatabase() {
    await teams.deleteMembership(event!.voting_moderators_team_id, membershipIDToDelete!)
    setMembershipIDToDelete(undefined)
  }

  return (
    <Modal
      isOpen={membershipIDToDelete !== undefined}
      onAccept={deleteParticipantFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setMembershipIDToDelete(undefined)}
      title='Удалить участника'
    />
  )
}
