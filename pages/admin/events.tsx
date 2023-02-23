import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { ReactElement, useEffect, useState } from 'react'
import { Databases, ID, Models, Permission, Role } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import {
  appwriteEventsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import useUser from '@/lib/useUser'
import { toast } from 'react-hot-toast'
import { TrashIcon } from '@heroicons/react/24/outline'
import PanelWindow from '@/components/PanelWindow'

const Events = () => {
  const { client } = useAppwrite()
  const { user } = useUser()
  const [events, setEvents] = useState<Models.Document[]>([])
  const [newEventName, setNewEventName] = useState('')
  const databases = new Databases(client!)

  useEffect(() => {
    updateEvents()
  }, [])

  function updateEvents() {
    databases
      .listDocuments(appwriteVotingDatabase, appwriteEventsCollection)
      .then((res) => setEvents(res.documents.reverse()))
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
        updateEvents()
      } else {
        toast.error('Введите название события')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function deleteEvent(eventId: string) {
    console.log(eventId)
    try {
      await new Databases(client!).deleteDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventId,
      )
      updateEvents()
    } catch (error: any) {
      toast.error(error)
    }
  }

  return (
    <div className='grid grid-cols-3 grid-flow-row-dense gap-4 p-3'>
      <PanelWindow inCard>
        <input
          type='text'
          placeholder='Название события'
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          className='input input-bordered input-secondary w-full max-w-xs'
        />
        <button className='btn btn-ghost btn-primary' onClick={createEvent}>
          Создать событие
        </button>
      </PanelWindow>
      <PanelWindow className='col-span-3 lg:col-span-2 row-span-3'>
        <div className='overflow-x-auto'>
          <table className='table table-compact w-full'>
            <thead>
              <tr>
                <th />
                <th>Название</th>
                <th>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr>
                  <th className='font-light text-slate-500 text-xs'>{event.$id.slice(-7)}</th>
                  <td>{event.name}</td>
                  <td>
                    {event.creator_id === user?.userData?.$id && (
                      <button className='hover:text-red-500' onClick={() => deleteEvent(event.$id)}>
                        <TrashIcon className='w-5 h-5' />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelWindow>
      <PanelWindow inCard>
        <button onClick={updateEvents} className='btn btn-ghost'>
          Обновить список событий
        </button>
      </PanelWindow>
    </div>
  )
}

Events.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Events
