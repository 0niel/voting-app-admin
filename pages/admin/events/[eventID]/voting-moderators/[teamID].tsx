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
  const { eventID, teamID } = router.query
  const [event, setEvent] = useState<Models.Document>()
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const [emailInvite, setEmailInvite] = useState('')
  const { setMembershipIDToDelete, setTeamIDRelatedToMembershipToDelete } = useMembership()

  useEffect(() => {
    try {
      updateMemberships()
      new Databases(client!)
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventID as string)
        .then((response) => setEvent(response))
      client!.subscribe('memberships', async (response) => {
        // @ts-ignore
        if (response.payload!.teamId === teamID) {
          updateMemberships()
        }
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
        await new Teams(client!).createMembership(teamID as string, newEmail, [], redirectURL)
        setEmailInvite('')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <h1 className='text-start text-2xl md:text-center'>
        <span className='text-slate-500 dark:text-slate-400'>Событие </span>
        <span className='font-bold'>{event?.name}</span>
      </h1>
      <div className='grid grid-flow-row-dense grid-cols-4 place-items-stretch gap-4 p-3'>
        {event && (
          <TeamsNavigation
            className='place-item-center col-span-4'
            buttons={[
              {
                name: 'Модераторы доступа',
                keyword: 'access-moderators',
                path: `/admin/events/${event.$id}/access-moderators/${event.access_moderators_team_id}`,
              },
              {
                name: 'Модераторы голосования',
                keyword: 'voting-moderators',
                path: `/admin/events/${event.$id}/voting-moderators/${event.voting_moderators_team_id}`,
              },
              {
                name: 'Участники',
                keyword: 'participants',
                path: `/admin/events/${event.$id}/participants/${event.participants_team_id}`,
              },
            ]}
          />
        )}
        <PanelWindow inCard className='col-span-4 md:col-span-1'>
          <h3 className='pb-1 text-xl'>Пригласить модератора голосования</h3>
          <div className='pb-2'>
            <input
              type='text'
              placeholder='Почта нового модератора'
              value={emailInvite}
              onChange={(e) => setEmailInvite(e.target.value)}
              className='input-bordered input w-full max-w-xs'
            />
          </div>
          <button className='btn-secondary btn-ghost btn' onClick={createMembership}>
            Пригласить
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-4 row-span-3 md:col-span-3'>
          <div className='overflow-x-auto'>
            <table className='table-compact table w-full'>
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
