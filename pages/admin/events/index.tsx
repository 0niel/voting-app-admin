import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { Account, Databases, ID, Models, Permission, Role, Teams } from "appwrite";
import { useAppwrite } from '@/context/AppwriteContext'
import {
  appwriteEventsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import useUser from '@/lib/useUser'
import { toast } from 'react-hot-toast'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import PanelWindow from '@/components/PanelWindow'
import Link from 'next/link'
import UpdateEventModal from '@/components/events/UpdateEventModal'
import { useEvent } from '@/context/EventContext'
import DeleteEventModal from '@/components/events/DeleteEventModal'

const Events = () => {
  const { client } = useAppwrite()
  const { setEventIdToUpdate, setEventIdToDelete } = useEvent()
  const { user } = useUser()
  const [events, setEvents] = useState<Models.Document[]>([])
  const [newEventName, setNewEventName] = useState('')
  const [userTeamIDs, setUserTeamIDs] = useState<string[]>([])
  const databases = new Databases(client)
  const teams = new Teams(client)
  const [userTeamIDs, setUserTeamIDs] = useState<string[]>()

  useEffect(() => {
    const subscribe = async function () {
      await updateEventList()
      client.subscribe('documents', (response) => {
        if (
          // @ts-ignore
          response.payload!.$databaseId === appwriteVotingDatabase &&
          // @ts-ignore
          response.payload!.$collectionId === appwriteEventsCollection
        ) {
          updateEventList()
        }
      })
    }
    subscribe().catch((error) => toast.error(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateEventList() {
    try {
      setEvents(
        (
          await databases.listDocuments(appwriteVotingDatabase, appwriteEventsCollection)
        ).documents.reverse(),
      )
      setUserTeamIDs((await teams.list()).teams.map((team) => team.$id))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function createEvent() {
    try {
      const eventName = newEventName?.trim()
      if (eventName && eventName.length > 0) {
        const accessModeratorsTeamID = (
          await teams.create(ID.unique(), `Модераторы доступа ${eventName}`, ['owner'])
        ).$id
        const votingModeratorsTeamID = (
          await teams.create(ID.unique(), `Модераторы голосования ${eventName}`, ['owner'])
        ).$id
        const participantsTeamID = (
          await teams.create(ID.unique(), `Участники ${eventName}`, ['owner'])
        ).$id
        await databases.createDocument(
          appwriteVotingDatabase,
          appwriteEventsCollection,
          ID.unique(),
          {
            name: eventName,
            creator_id: user?.userData?.$id,
            access_moderators_team_id: accessModeratorsTeamID,
            voting_moderators_team_id: votingModeratorsTeamID,
            participants_team_id: participantsTeamID,
          },
          [
            Permission.read(Role.team(appwriteSuperUsersTeam)),
            Permission.read(Role.team(accessModeratorsTeamID)),
            Permission.read(Role.team(votingModeratorsTeamID)),
            Permission.read(Role.team(participantsTeamID)),
            Permission.read(Role.team(accessModeratorsTeamID)),
            Permission.update(Role.user(user?.userData?.$id!)),
            Permission.delete(Role.user(user?.userData?.$id!)),
          ],
        )
        setNewEventName('')
      } else {
        toast.error('Введите название события.')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className='grid grid-flow-row-dense grid-cols-4 gap-4 p-3'>
        <PanelWindow inCard className='col-span-4 md:col-span-1'>
          <input
            type='text'
            placeholder='Название события'
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            className='input-bordered input w-full'
          />
          <button className='btn-outline btn-secondary btn' onClick={createEvent}>
            Создать событие
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-4 row-span-3 md:col-span-3'>
          <div className='overflow-x-auto'>
            <table className='table-compact table w-full'>
              <thead className='[&_th]:font-semibold'>
                <tr>
                  <th className='rounded-tl-md' />
                  <th>Название</th>
                  <th>Модер. доступа</th>
                  <th>Модер. голос.</th>
                  <th>Участники</th>
                  <th className='rounded-tr-md' />
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <th className='text-xs font-light'>{event.$id.slice(-7)}</th>
                    <td className='max-w-[10rem] overflow-hidden text-ellipsis'>{event.name}</td>
                    <td className='text-xs font-light'>
                      {userTeamIDs?.includes(event.access_moderators_team_id) ? (
                        <Link
                          href={`/admin/events/${event.$id}/access-moderators`}
                          className='dark-hover:text-blue-400 link-hover link after:content-["_↗"] hover:text-blue-600'
                        >
                          {event.access_moderators_team_id.slice(-7)}
                        </Link>
                      ) : (
                        event.access_moderators_team_id?.slice(-7) || 'нет'
                      )}
                    </td>
                    <td className='text-xs font-light'>
                      {userTeamIDs?.includes(event.voting_moderators_team_id) ? (
                        <Link
                          href={`/admin/events/${event.$id}/voting-moderators`}
                          className='dark-hover:text-blue-400 link-hover link after:content-["_↗"] hover:text-blue-600'
                        >
                          {event.voting_moderators_team_id.slice(-7)}
                        </Link>
                      ) : (
                        event.voting_moderators_team_id?.slice(-7) || 'нет'
                      )}
                    </td>
                    <td className='text-xs font-light'>
                      {userTeamIDs?.includes(event.participants_team_id) ? (
                        <Link
                          href={`/admin/events/${event.$id}/participants`}
                          className='dark-hover:text-blue-400 link-hover link after:content-["_↗"] hover:text-blue-600'
                        >
                          {event.participants_team_id.slice(-7)}
                        </Link>
                      ) : (
                        event.participants_team_id?.slice(-7) || 'нет'
                      )}
                    </td>
                    <td>
                      {event.creator_id === user?.userData?.$id && (
                        <>
                          <button
                            className='px-1 hover:text-info'
                            onClick={() => setEventIdToUpdate(event.$id)}
                          >
                            <PencilIcon className='h-5 w-5' />
                          </button>
                          <button
                            className='px-1 hover:text-error'
                            onClick={() => setEventIdToDelete(event.$id)}
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelWindow>
      </div>
      <UpdateEventModal />
      <DeleteEventModal />
    </>
  )
}

Events.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Events
