import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppwrite } from '@/context/AppwriteContext'
import { Databases, Models, Teams } from 'appwrite'
import PanelWindow from '@/components/PanelWindow'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/formatDate'
import { UserMinusIcon } from '@heroicons/react/24/outline'
import DeleteMembershipModal from '@/components/teams/DeleteMembershipModal'
import { useMembership } from '@/context/MembershipContext'
import {
  appwriteEventsCollection,
  appwriteVotingDatabase,
  redirectURL,
} from '@/constants/constants'
import TeamsNavigation from '@/components/teams/TeamsNavigation'

const VotingModerators = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [teamID, setTeamID] = useState<string>()
  const [event, setEvent] = useState<Models.Document>()
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const [emailInvite, setEmailInvite] = useState('')
  const { setMembershipIDToDelete, setTeamIDRelatedToMembershipToDelete } = useMembership()
  const databases = new Databases(client)
  const teams = new Teams(client)

  useEffect(() => {
    try {
      databases
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventID as string)
        .then((e) => {
          setEvent(e)
          const _teamID = e.voting_moderators_team_id
          setTeamID(_teamID)
          updateMemberships(_teamID)
          client.subscribe('memberships', async (response) => {
            // @ts-ignore
            if (response.payload!.teamId === teamID) {
              updateMemberships(_teamID)
            }
          })
        })
    } catch (error: any) {
      toast.error(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateMemberships(_teamID: string) {
    teams
      .listMemberships(_teamID)
      .then((membershipList) => setMemberships(membershipList.memberships.reverse()))
      .catch((error) => toast.error(error.message))
  }

  async function createMembership() {
    try {
      const newEmail = emailInvite?.trim()
      if (newEmail && newEmail.length > 0) {
        await new Teams(client!).createMembership(teamID as string, newEmail, [], redirectURL)
        setEmailInvite('')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <h1 className='p-1 text-start text-2xl text-base-content md:text-center'>
        <span>Событие</span>
        <span className='pl-1 font-bold'>{event?.name}</span>
      </h1>
      <TeamsNavigation className='place-item-center col-span-4' eventID={event?.$id} />
      <div className='grid grid-flow-row-dense grid-cols-4 place-items-stretch gap-4 px-3'>
        <PanelWindow inCard className='col-span-4 md:col-span-1'>
          <div className='form-control w-full max-w-xs'>
            <label className='label'>
              <span className='label-text overflow-hidden truncate text-ellipsis'>
                Пригласить модератора голосования
              </span>
            </label>
            <input
              type='text'
              placeholder='email'
              value={emailInvite}
              onChange={(e) => setEmailInvite(e.target.value)}
              className='input-bordered input w-full'
            />
          </div>
          <button className='btn-outline btn-secondary btn' onClick={createMembership}>
            Пригласить
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-4 row-span-3 md:col-span-3'>
          <div className='overflow-x-auto'>
            <table className='table-compact table w-full'>
              <thead className='[&_th]:font-semibold'>
                <tr>
                  <th className='rounded-tl-md' />
                  <th>Имя</th>
                  <th>Почта</th>
                  <th>Роли</th>
                  <th>Приглашен</th>
                  <th>Вступил</th>
                  <th className='rounded-tr-md' />
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership, index) => (
                  <tr key={index}>
                    <th className='text-xs font-light'>{membership.$id.slice(-7)}</th>
                    <td className='max-w-[10rem] overflow-hidden text-ellipsis'>
                      {membership.userEmail}
                    </td>
                    <td className='max-w-[10rem] overflow-hidden text-ellipsis'>
                      {membership.userEmail}
                    </td>
                    <td className='max-w-[10rem] overflow-hidden text-ellipsis'>
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
                          <UserMinusIcon className='h-5 w-5' />
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

VotingModerators.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default VotingModerators
