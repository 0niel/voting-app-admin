import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppwrite } from '@/context/AppwriteContext'
import { Models, Teams } from 'appwrite'
import PanelWindow from '@/components/PanelWindow'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/formatDate'
import { UserMinusIcon } from '@heroicons/react/24/outline'
import DeleteMembershipModal from '@/components/teams/DeleteMembershipModal'
import { useMembership } from '@/context/MembershipContext'

const AccessModerators = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID, teamID } = router.query
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const [emailInvite, setEmailInvite] = useState('')
  const { setMembershipIDToDelete, setTeamIDRelatedToMembershipToDelete } = useMembership()

  useEffect(() => {
    try {
      updateMemberships()
      client!.subscribe('memberships', async (response) => {
        updateMemberships()
      })
    } catch (error: any) {
      toast.error(error)
    }
  }, [])

  function updateMemberships() {
    new Teams(client!)
      .listMemberships(teamID as string)
      .then((membershipList) => {
        setMemberships(membershipList.memberships.reverse())
      })
      .catch((error) => toast.error(error.message))
  }

  async function createMembership() {
    try {
      const newEmail = emailInvite?.trim()
      if (newEmail && newEmail.length > 0) {
        await new Teams(client!).createMembership(
          teamID as string,
          newEmail,
          [],
          'http://localhost:3000',
        )
        setEmailInvite('')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className='grid grid-cols-4 grid-flow-row-dense gap-4 p-3'>
        <PanelWindow inCard className='col-span-4 md:col-span-1'>
          <h3 className='pb-1 text-xl'>Пригласить модератора доступа</h3>
          <div className='pb-2'>
            <input
              type='text'
              placeholder='Почта нового модератора'
              value={emailInvite}
              onChange={(e) => setEmailInvite(e.target.value)}
              className='input input-bordered input-accent w-full max-w-xs'
            />
          </div>
          <button className='btn btn-ghost btn-secondary' onClick={createMembership}>
            Пригласить
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-4 md:col-span-3 row-span-3'>
          <div className='overflow-x-auto'>
            <table className='table table-compact w-full'>
              <thead>
                <tr>
                  <th />
                  <th>Имя</th>
                  <th>Почта</th>
                  <th>Роли</th>
                  <th>Приглашен</th>
                  <th>Вступил</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership, index) => (
                  <tr key={index}>
                    <th className='font-light text-xs'>{membership.$id.slice(-7)}</th>
                    <td className='max-w-[10rem] text-ellipsis overflow-hidden'>
                      {membership.userEmail}
                    </td>
                    <td className='max-w-[10rem] text-ellipsis overflow-hidden'>
                      {membership.userEmail}
                    </td>
                    <td className='max-w-[10rem] text-ellipsis overflow-hidden'>
                      {membership.roles.join(', ')}
                    </td>
                    <td>{formatDate(membership.invited)}</td>
                    <td>{membership.joined && formatDate(membership.joined)}</td>
                    <td>
                      {!membership.roles.includes('owner') && (
                        <button
                          className='hover:text-error'
                          onClick={() => {
                            setMembershipIDToDelete(membership.$id)
                            setTeamIDRelatedToMembershipToDelete(membership.teamId)
                          }}
                        >
                          <UserMinusIcon className='w-5 h-5' />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelWindow>
      </div>
      <DeleteMembershipModal />
    </>
  )
}

AccessModerators.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default AccessModerators
