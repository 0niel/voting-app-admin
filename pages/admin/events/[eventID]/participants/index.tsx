import { Databases, Models, Query, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CreateParticipantsModal from '@/components/events/participants/CreateParticipantsModal'
import DeleteParticipantsModal from '@/components/events/participants/DeleteParticipantsModal'
import TeamsNavigation from '@/components/events/TeamsNavigation'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell } from '@/components/Table'
import {
  appwriteEventsCollection,
  appwriteListMembershipsLimit,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import { GetMembershipRows, membershipColumns } from '@/lib/memberships'
import { membershipsRealtimeResponseCallback } from '@/lib/membershipsRealtimeResponseCallback'
import { EventDocument } from '@/lib/models/EventDocument'
import usePermitted from '@/lib/usePermitted'
import useUser from '@/lib/useUser'

const Participants = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [event, setEvent] = useState<EventDocument>()
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const { setCreateMembership } = useMembership()
  const databases = new Databases(client)
  const teams = new Teams(client)
  const isPermitted = usePermitted(memberships)
  const [hasPermissionToCreteEvent, setHasPermissionToCreteEvent] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = (await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )) as EventDocument
      setEvent(_event)
      await updateMemberships(_event.participants_team_id)
      client.subscribe('memberships', async (response) => {
        // @ts-ignore
        if (!response.payload?.roles?.includes('owner')) {
          membershipsRealtimeResponseCallback(response, setMemberships, _event.participants_team_id)
        }
      })
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    const permissionToCreate = memberships.some(
      (membership) =>
        membership.userId === user?.userData?.$id && membership.roles.includes('owner'),
    )
    setHasPermissionToCreteEvent(permissionToCreate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberships])

  async function updateMemberships(_teamID?: string) {
    try {
      const membershipList = await teams.listMemberships(_teamID || event?.participants_team_id!, [
        Query.limit(appwriteListMembershipsLimit),
      ])
      setMemberships(membershipList.memberships.reverse())
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const rows: Cell[][] = GetMembershipRows(
    memberships.filter((membership) => !membership.roles.includes('owner')),
    isPermitted,
  )

  return (
    <>
      {event && <TeamsNavigation className='place-item-center col-span-4' event={event} />}
      <Table
        title={`Список участников ${event?.name}`}
        description='Участники могут принимать участие в голосованиях.'
        action='Пригласить участника'
        columns={membershipColumns}
        rows={rows}
        onActionClick={() => setCreateMembership(true)}
        isDisabledAction={!hasPermissionToCreteEvent}
      />
      <CreateParticipantsModal />
      <DeleteParticipantsModal />
    </>
  )
}

Participants.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Participants
