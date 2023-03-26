import { Account, Databases, Query } from 'appwrite'
import Link from 'next/link'
import React, { ReactElement, useEffect, useState } from 'react'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import {
  appwriteEventsCollection,
  appwriteListEventsLimit,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { EventDocument } from '@/lib/models/EventDocument'

const Export = () => {
  const [events, setEvents] = useState<EventDocument[]>([])
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)
  const [selectedEventID, setSelectedEventID] = useState<string>()
  const [jwt, setJwt] = useState<string>()

  useEffect(() => {
    const fetchEvents = async () => {
      const events = (
        await databases.listDocuments(appwriteVotingDatabase, appwriteEventsCollection, [
          Query.limit(appwriteListEventsLimit),
        ])
      ).documents.reverse() as EventDocument[]
      if (events.length > 0) {
        setSelectedEventID(events[0].$id)
      }
      setEvents(events)
      setJwt(await account.createJWT().then((jwtModel) => jwtModel.jwt))
    }

    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='px-4 sm:px-6 lg:px-8'>
      <div className='sm:flex sm:items-center'>
        <div className='sm:flex-auto'>
          <h1 className='text-xl font-semibold text-gray-900'>Экспорт мероприятий</h1>
          <p className='mt-2 text-sm text-gray-700'>
            <label
              htmlFor='events'
              className='mb-2 block text-sm font-medium text-gray-900 dark:text-white'
            >
              Выберете мероприятие:
            </label>
            {events.length > 0 ? (
              <select
                value={selectedEventID}
                onChange={(event) => setSelectedEventID(event.target.value)}
                id='events'
                className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary'
              >
                {events.map((event, index) => (
                  <option key={index} value={event.$id}>
                    {event.name}
                  </option>
                ))}
              </select>
            ) : (
              'Мероприятий нет.'
            )}
          </p>
        </div>
        <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
          <Link
            className='hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white
           shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 sm:w-auto'
            href={{
              pathname: '/api/events/export',
              query: {
                eventID: selectedEventID,
                jwt,
              },
            }}
            target='__blank'
          >
            Экспортировать
          </Link>
        </div>
      </div>
    </div>
  )
}

Export.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Export
