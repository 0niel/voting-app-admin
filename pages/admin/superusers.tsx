import { TrashIcon } from '@heroicons/react/24/outline'
import { Models, Teams } from 'appwrite'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import CreateSuperuserModal from '@/components/superusers/CreateSuperuserModal'
import DeleteSuperuserModal from '@/components/superusers/DeleteSuperuserModal'
import Table from '@/components/Table'
import { appwriteSuperUsersTeam } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import { formatDate } from '@/lib/formatDate'
import { membershipColumns } from '@/lib/memberships'
import { membershipsRealtimeResponseCallback } from '@/lib/membershipsRealtimeResponseCallback'

const Superusers = () => {
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const { setCreateMembership, setMembershipIDToDelete } = useMembership() // userID
  const { client } = useAppwrite()
  const teams = new Teams(client)

  useEffect(() => {
    updateMemberships().catch((error: any) => toast.error(error.message))
    client.subscribe('memberships', async (response) => {
      membershipsRealtimeResponseCallback(response, setMemberships, appwriteSuperUsersTeam)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateMemberships() {
    setMemberships((await teams.listMemberships(appwriteSuperUsersTeam)).memberships.reverse())
  }
  const rows = memberships.map((membership) => {
    return [
      { value: membership.$id },
      { value: membership.userName },
      { value: membership.userEmail },
      { value: membership.roles.join(', ') },
      { value: formatDate(membership.invited) },
      {
        value: (
          <button
            className='btn-outline btn-secondary btn'
            onClick={() => setMembershipIDToDelete(membership.userId)}
          >
            <TrashIcon className='h-6 w-6' />
          </button>
        ),
      },
    ]
  })

  return (
    <>
      <Table
        columns={membershipColumns}
        rows={rows}
        title='Список суперпользователей'
        description='Суперпользватели могут создавать мероприятия, приглашать модераторов доступа, голосования, участников'
        action='Пригласить суперпользователя'
        onActionClick={() => setCreateMembership(true)}
      />
      <CreateSuperuserModal />
      <DeleteSuperuserModal />
    </>
  )
}

Superusers.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Superusers
