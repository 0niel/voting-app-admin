import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppwrite } from '@/context/AppwriteContext'
import { Databases, Models } from 'appwrite'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import PanelWindow from '@/components/PanelWindow'

const Event = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventId } = router.query
  const [event, setEvent] = useState<Models.Document>()

  useEffect(() => {
    updateEvent()
    client!.subscribe('documents', (response) => {
      if (
        // @ts-ignore
        response.payload!.$databaseId === appwriteVotingDatabase &&
        // @ts-ignore
        response.payload!.$collectionId === appwriteEventsCollection &&
        // @ts-ignore
        response.payload!.$documentID === eventId
      ) {
        updateEvent()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateEvent() {
    new Databases(client!)
      .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventId as string)
      .then((res) => setEvent(res))
  }

  return (
    <div className='grid grid-cols-4 grid-flow-row-dense gap-4 p-3'>
      <PanelWindow inCard className='col-span-4'>
        Событие
        <div className='flex items-baseline'>
          <div className='font-light text-slate-500 pr-1 hover:text-base-content'>
            {event?.$id.slice(-7)}
          </div>
          <div className='text-4xl font-semibold'>{event?.name}</div>
        </div>
      </PanelWindow>
    </div>
  )
}

Event.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Event
