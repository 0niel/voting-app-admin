import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { Databases, ID, Models, Permission, Role, Teams } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
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
  const databases = new Databases(client!)

  useEffect(() => {
    try {
      updateEventList()
      client!.subscribe('documents', (response) => {
        if (
          // @ts-ignore
          response.payload!.$databaseId === appwriteVotingDatabase &&
          // @ts-ignore
          response.payload!.$collectionId === appwriteEventsCollection
        ) {
          updateEventList()
        }
      })
    } catch (error: any) {
      toast.error(error.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateEventList() {
    try {
      databases
        .listDocuments(appwriteVotingDatabase, appwriteEventsCollection)
        .then((res) => setEvents(res.documents.reverse()))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function createEvent() {
    try {
      const eventName = newEventName?.trim()
      if (eventName && eventName.length > 0) {
        const accessModeratorsTeamID = (
          await new Teams(client!).create(ID.unique(), `Модераторы доступа ${eventName}`, ['owner'])
        ).$id
        const votingModeratorsTeamID = (
          await new Teams(client!).create(ID.unique(), `Модераторы голосования ${eventName}`, [
            'owner',
          ])
        ).$id
        const participantsTeamID = (
          await new Teams(client!).create(ID.unique(), `Участники ${eventName}`, ['owner'])
        ).$id
        await new Databases(client!).createDocument(
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
            Permission.read(Role.users()),
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
            className='input-bordered input-accent input w-full max-w-xs'
          />
          <button className='btn-secondary btn-ghost btn' onClick={createEvent}>
            Создать событие
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-4 row-span-3 md:col-span-3'>
          <div className='overflow-x-auto'>
            <table className='table-compact table w-full'>
              <thead>
                <tr>
                  <th />
                  <th>Название</th>
                  <th>Модер. доступа</th>
                  <th>Модер. голос.</th>
                  <th>Участники</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <th className='text-xs font-light'>{event.$id.slice(-7)}</th>
                    <td className='max-w-[10rem] overflow-hidden text-ellipsis'>{event.name}</td>
                    <td className='text-xs font-light'>
                      {event.creator_id === user?.userData?.$id &&
                      event.access_moderators_team_id ? (
                        <Link
                          href={`/admin/events/${event.$id}/access-moderators/${event.access_moderators_team_id}`}
                          className='dark-hover:text-blue-400 link-hover link after:content-["_↗"] hover:text-blue-600'
                        >
                          {event.access_moderators_team_id.slice(-7)}
                        </Link>
                      ) : (
                        event.access_moderators_team_id?.slice(-7) || 'нет'
                      )}
                    </td>
                    <td className='text-xs font-light'>
                      {event.creator_id === user?.userData?.$id &&
                      event.voting_moderators_team_id ? (
                        <Link
                          href={`/admin/events/${event.$id}/voting-moderators/${event.voting_moderators_team_id}`}
                          className='dark-hover:text-blue-400 link-hover link after:content-["_↗"] hover:text-blue-600'
                        >
                          {event.voting_moderators_team_id.slice(-7)}
                        </Link>
                      ) : (
                        event.voting_moderators_team_id?.slice(-7) || 'нет'
                      )}
                    </td>
                    <td className='text-xs font-light'>
                      {event.creator_id === user?.userData?.$id && event.participants_team_id ? (
                        <Link
                          href={`/admin/events/${event.$id}/participants/${event.participants_team_id}`}
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
