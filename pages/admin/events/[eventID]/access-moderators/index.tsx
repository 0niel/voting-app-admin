import { Databases, Models, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CreateAccessModeratorModal from '@/components/events/access-moderators/CreateAccessModeratorModal'
import DeleteAccessModeratorModal from '@/components/events/access-moderators/DeleteAccessModeratorModal'
import TeamsNavigation from '@/components/events/TeamsNavigation'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell } from '@/components/Table'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import { GetMembershipRows, membershipColumns } from '@/lib/memberships'
import { membershipsRealtimeResponseCallback } from '@/lib/membershipsRealtimeResponseCallback'
import { EventDocument } from '@/lib/models/EventDocument'
import usePermitted from '@/lib/usePermitted'
import useUser from '@/lib/useUser'

const AccessModerators = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [event, setEvent] = useState<EventDocument>()
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const databases = new Databases(client)
  const teams = new Teams(client)
  const isPermitted = usePermitted(memberships)
  const { setCreateMembership } = useMembership()
  const { user } = useUser()
  const [hasPermissionToCreteEvent, setHasPermissionToCreteEvent] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = (await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )) as EventDocument
      setEvent(_event)
      await updateMemberships(_event.access_moderators_team_id)
      client.subscribe('memberships', async (response) => {
        membershipsRealtimeResponseCallback(
          response,
          setMemberships,
          _event.access_moderators_team_id,
        )
      })
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function updateMemberships(_teamID?: string) {
    try {
      const membershipList = await teams.listMemberships(
        _teamID || event?.access_moderators_team_id!,
      )
      setMemberships(membershipList.memberships.reverse())
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const permissionToCreate = memberships.some(
      (membership) =>
        membership.userId === user?.userData?.$id && membership.roles.includes('owner'),
    )
    setHasPermissionToCreteEvent(permissionToCreate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberships])

  const rows: Cell[][] = GetMembershipRows(memberships, isPermitted)

  return (
    <>
      {event && <TeamsNavigation className='place-item-center col-span-4' event={event} />}
      <Table
        title={`Список модераторов доступа ${event?.name}`}
        description='Модераторы доступа могут приглашать новых участников в мероприятие.'
        action='Пригласить модер. дост.'
        columns={membershipColumns}
        rows={rows}
        onActionClick={() => setCreateMembership(true)}
        isDisabledAction={!hasPermissionToCreteEvent}
      />
      <CreateAccessModeratorModal />
      <DeleteAccessModeratorModal />
    </>
  )
}

AccessModerators.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default AccessModerators
