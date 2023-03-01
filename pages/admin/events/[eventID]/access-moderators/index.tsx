import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppwrite } from '@/context/AppwriteContext'
import { Account, Databases, Models, Query, Teams } from 'appwrite'
import PanelWindow from '@/components/PanelWindow'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/formatDate'
import { UserMinusIcon } from '@heroicons/react/24/outline'
import DeleteMembershipModal from '@/components/teams/DeleteMembershipModal'
import { useMembership } from '@/context/MembershipContext'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import TeamsNavigation from '@/components/teams/TeamsNavigation'
import useUser from '@/lib/useUser'
import usePermitted from '@/lib/usePermitted'

const AccessModerators = () => {
  const { client } = useAppwrite()
  const { user } = useUser()
  const router = useRouter()
  const { eventID } = router.query
  const [teamID, setTeamID] = useState<string>()
  const [event, setEvent] = useState<Models.Document>()
  const [memberships, setMemberships] = useState<Models.Membership[]>([])
  const [emailInvite, setEmailInvite] = useState('')
  const { setMembershipIDToDelete, setTeamIDRelatedToMembershipToDelete, setPostDeleteAction } =
    useMembership()
  const databases = new Databases(client)
  const teams = new Teams(client)
  const account = new Account(client)
  const isPermitted = usePermitted(memberships)

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event)
      const _teamID = _event.access_moderators_team_id
      setTeamID(_teamID)
      updateMemberships(_teamID)
      client.subscribe('memberships', async (response) => {
        updateMemberships()
      })
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  function updateMemberships(_teamID?: string) {
    teams
      .listMemberships(_teamID || teamID!)
      .then((membershipList) => setMemberships(membershipList.memberships.reverse()))
      .catch((error) => toast.error(error.message))
  }

  async function createMembership() {
    try {
      const newEmail = emailInvite?.trim()
      if (newEmail && newEmail.length > 0) {
        const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
        await fetch('/api/teams/create-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamID: teamID!,
            email: newEmail,
            roles: [],
            url: process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME,
            jwt,
          }),
        }).catch((error: any) => toast.error(error.message))
        await fetch('/api/teams/create-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamID: event!.participants_team_id!,
            email: newEmail,
            roles: ['owner'],
            url: process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME,
            jwt,
          }),
        }).catch((error: any) => toast.error(error.message))
        setEmailInvite('')
        updateMemberships()
      } else {
        toast.error('Укажите действительную почту.')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <h1 className='p-1 text-start text-2xl text-base-content md:text-center'>
        <span className='text-neutral'>Событие</span>
        <span className='pl-1 font-bold'>{event?.name}</span>
      </h1>
      <TeamsNavigation className='place-item-center col-span-4' event={event} />
      <div className='grid grid-flow-row-dense grid-cols-4 place-items-stretch gap-4 px-3'>
        <PanelWindow inCard className='col-span-4 md:col-span-1'>
          <div className='form-control w-full max-w-xs'>
            <label className='label'>
              <span className='label-text overflow-hidden truncate text-ellipsis'>
                Пригласить модератора доступа
              </span>
            </label>
            <input
              type='text'
              placeholder='email'
              value={emailInvite}
              disabled={!isPermitted}
              onChange={(e) => setEmailInvite(e.target.value)}
              className='input-bordered input w-full'
            />
          </div>
          <button
            disabled={!isPermitted}
            className='btn-outline btn-secondary btn'
            onClick={createMembership}
          >
            Пригласить
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-4 row-span-4 md:col-span-3'>
          <div className='overflow-x-auto'>
            <table className='w-full table-auto md:table-fixed'>
              <thead className='[&_th]:font-semibold'>
                <tr>
                  <th className='rounded-tl-md' />
                  <th>Имя</th>
                  <th>Почта</th>
                  <th>Роли</th>
                  <th>Приглашен</th>
                  <th className='rounded-tr-md' />
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership, index) => (
                  <tr key={index}>
                    <th className='text-xs font-light'>{membership.$id.slice(-7)}</th>
                    <td className='max-w-[30rem] overflow-hidden text-ellipsis'>
                      {membership.userEmail}
                    </td>
                    <td className='max-w-[30rem] overflow-hidden text-ellipsis'>
                      {membership.userEmail}
                    </td>
                    <td className='max-w-[30rem] overflow-hidden text-ellipsis'>
                      {membership.roles.join(', ')}
                    </td>
                    <td>{formatDate(membership.invited)}</td>
                    <td>
                      {!membership.roles.includes('owner') && isPermitted && (
                        <button
                          className='hover:text-error'
                          onClick={() => {
                            setPostDeleteAction(async function () {
                              ;(
                                await new Teams(client!).listMemberships(
                                  event!.participants_team_id,
                                  [Query.equal('userId', membership.userId)],
                                )
                              ).memberships.map(async (membership) => {
                                await new Teams(client!).deleteMembership(
                                  event!.participants_team_id,
                                  membership.$id,
                                )
                              })
                            })
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

AccessModerators.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default AccessModerators
