import { Databases, Models, Query, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'

export default function DeleteAccessModeratorModal() {
  const { membershipIDToDelete, setMembershipIDToDelete } = useMembership()
  const router = useRouter()
  const { eventID } = router.query
  const [event, setEvent] = useState<Models.Document>()
  const [membership, setMembership] = useState<Models.Membership>()
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const teams = new Teams(client)

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event)
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    const fetchMembership = async () => {
      const _membership = await teams.getMembership(
        event?.access_moderators_team_id,
        membershipIDToDelete!,
      )
      setMembership(_membership)
    }
    if (membershipIDToDelete !== undefined) {
      fetchMembership().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipIDToDelete])
  async function deleteAccessModeratorFromDatabase() {
    await new Teams(client!).deleteMembership(
      event!.access_moderators_team_id,
      membershipIDToDelete!,
    )
    const memberships = await new Teams(client!).listMemberships(event!.participants_team_id, [
      Query.equal('userId', membership!.userId),
    ])
    memberships.memberships.map(async (membership) => {
      await new Teams(client!).deleteMembership(event!.participants_team_id, membership.$id)
    })
    setMembershipIDToDelete(undefined)
  }

  return (
    <Modal
      isOpen={membershipIDToDelete !== undefined}
      onAccept={deleteAccessModeratorFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setMembershipIDToDelete(undefined)}
      title='Удалить модератора доступа'
    />
  )
}
