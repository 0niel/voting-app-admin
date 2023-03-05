import { Databases, Models, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CreateAccessModeratorModal from '@/components/events/access-moderators/CreateAccessModeratorModal'
import DeleteAccessModeratorModal from '@/components/events/access-moderators/DeleteAccessModeratorModal'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell, Column } from '@/components/Table'
import TeamsNavigation from '@/components/teams/TeamsNavigation'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import { GetMembershipRows, membershipColumns } from '@/lib/memberships'
import { EventDocument } from '@/lib/models/EventDocument'
import usePermitted from '@/lib/usePermitted'

const AccessModerators = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [event, setEvent] = useState<EventDocument>()
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const { setMembershipIDToDelete } = useMembership()
  const databases = new Databases(client)
  const teams = new Teams(client)
  const isPermitted = usePermitted(memberships)
  const { setCreateMembership } = useMembership()

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event as EventDocument)
      await updateMemberships(_event.access_moderators_team_id)
      client.subscribe('memberships', async (response) => {
        await updateMemberships(_event.access_moderators_team_id)
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

  const rows: Cell[][] = GetMembershipRows(memberships, isPermitted)

  return (
    <>
      <TeamsNavigation className='place-item-center col-span-4' event={event} />
      <Table
        title='Список модераторов доступа'
        description={`Списко модераторов доступа ${event?.name}`}
        action='Пригласить'
        columns={membershipColumns}
        rows={rows}
        onActionClick={() => setCreateMembership(true)}
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
