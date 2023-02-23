import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { Databases, ID, Models, Permission, Role } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import {
  appwriteEventsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import useUser from '@/lib/useUser'
import { toast } from 'react-hot-toast'
import { ArrowTopRightOnSquareIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import PanelWindow from '@/components/PanelWindow'
import Link from 'next/link'
import UpdateEventModal from '@/components/events/UpdateEventModal'
import { UpdateEventProvider, useUpdateEvent } from '@/context/UpdateEventContext'

const Events = () => {
  const { client } = useAppwrite()
  const { setEventId } = useUpdateEvent()
  const { user } = useUser()
  const [events, setEvents] = useState<Models.Document[]>([])
  const [newEventName, setNewEventName] = useState('')
  const databases = new Databases(client!)

  useEffect(() => {
    updateEvents()
    client!.subscribe('documents', (response) => {
      if (
        // @ts-ignore
        response.payload!.$databaseId === appwriteVotingDatabase &&
        // @ts-ignore
        response.payload!.$collectionId === appwriteEventsCollection
      ) {
        updateEvents()
      }
    })
  }, [])

  function updateEvents() {
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
      if (newEventName) {
        await new Databases(client!).createDocument(
          appwriteVotingDatabase,
          appwriteEventsCollection,
          ID.unique(),
          { name: newEventName, creator_id: user?.userData?.$id },
          [
            Permission.read(Role.team(appwriteSuperUsersTeam)),
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

  async function deleteEvent(eventId: string) {
    try {
      await new Databases(client!).deleteDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventId,
      )
    } catch (error: any) {
      toast.error(error)
    }
  }

  return (
    <>
      <div className='grid grid-cols-3 grid-flow-row-dense gap-4 p-3'>
        <PanelWindow inCard className='col-span-3 md:col-span-1'>
          <input
            type='text'
            placeholder='Название события'
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            className='input input-bordered input-accent w-full max-w-xs'
          />
          <button className='btn btn-ghost btn-secondary' onClick={createEvent}>
            Создать событие
          </button>
        </PanelWindow>
        <PanelWindow className='col-span-3 md:col-span-2 row-span-3'>
          <div className='overflow-x-auto'>
            <table className='table table-compact w-full'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index}>
                    <th className='font-light text-slate-500 text-xs'>
                      {event.creator_id === user?.userData?.$id ? (
                        <Link
                          href={`/admin/events/${event.$id}`}
                          className='flex hover:underline hover:text-base-content'
                        >
                          {event.$id.slice(-7)}{' '}
                          <ArrowTopRightOnSquareIcon className='w-3 h-4 ml-0.5' />
                        </Link>
                      ) : (
                        event.$id.slice(-7)
                      )}
                    </th>
                    <td>{event.name.slice(0, 30)}</td>
                    <td>
                      {event.creator_id === user?.userData?.$id && (
                        <>
                          <button
                            className='hover:text-primary-focus px-1'
                            onClick={() => setEventId(event.$id)}
                          >
                            <PencilIcon className='w-5 h-5' />
                          </button>
                          <button
                            className='hover:text-red-500 px-1'
                            onClick={() => deleteEvent(event.$id)}
                          >
                            <TrashIcon className='w-5 h-5' />
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
    </>
  )
}

Events.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Events
