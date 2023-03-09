import { Databases, Teams } from 'appwrite'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import { EventDocument } from '@/lib/models/EventDocument'

export default function UpdateEventModal() {
  const [eventNewName, setEventNewName] = useState('')
  const [eventToUpdate, setEventToUpdate] = useState<EventDocument>()
  const { eventIdToUpdate, setEventIdToUpdate } = useEvent()
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const teams = new Teams(client)

  useEffect(() => {
    if (eventIdToUpdate != null) {
      databases
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToUpdate)
        .then((event) => {
          setEventToUpdate(event as EventDocument)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdToUpdate])

  async function updateEvent() {
    if (eventNewName.length > 0) {
      try {
        await teams.update(
          eventToUpdate!.access_moderators_team_id,
          `Модер. голос. ${eventNewName}`,
        )
        await teams.update(
          eventToUpdate!.voting_moderators_team_id,
          `Модер. голос. ${eventNewName}`,
        )
        await teams.update(eventToUpdate!.participants_team_id, `Участники ${eventNewName}`)
      } catch (error: any) {
        toast.error(error.message)
      }
      try {
        await databases.updateDocument(
          appwriteVotingDatabase,
          appwriteEventsCollection,
          eventIdToUpdate!,
          {
            name: eventNewName,
          },
        )
        setEventIdToUpdate(undefined)
        setEventNewName('')
      } catch (error: any) {
        toast.error(error.message)
      }
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
