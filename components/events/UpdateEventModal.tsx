import { Databases, Models } from 'appwrite'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'

export default function UpdateEventModal() {
  const [eventNewName, setEventNewName] = useState('')
  const [eventToUpdate, setEventToUpdate] = useState<Models.Document>()
  const { eventIdToUpdate, setEventIdToUpdate } = useEvent()
  const { client } = useAppwrite()
  const databases = new Databases(client)

  useEffect(() => {
    if (eventIdToUpdate != null) {
      databases
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToUpdate)
        .then((event) => {
          setEventToUpdate(event)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdToUpdate])

  async function updateEvent() {
    if (eventNewName.length > 0) {
      new Databases(client!)
        .updateDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToUpdate!, {
          name: eventNewName,
        })
        .then(() => setEventIdToUpdate(undefined))
        .catch((error) => toast.error(error))
        .finally(() => setEventNewName(''))
    } else {
      toast.error('Введите название события.')
    }
  }

  return (
    <Modal
      isOpen={eventIdToUpdate !== undefined}
      onAccept={updateEvent}
      acceptButtonName='Обновить'
      onCancel={() => setEventIdToUpdate(undefined)}
      title={`Обновить событие ${eventToUpdate?.name}`}
    >
      <div className='form-control w-full max-w-xs pt-5'>
        <label className='label'>
          <span className='label-text'>Название</span>
        </label>
        <input
          type='text'
          placeholder={eventToUpdate?.name}
          value={eventNewName}
          onChange={(e) => setEventNewName(e.target.value)}
          className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
      </div>
    </Modal>
  )
}
