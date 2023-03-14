import 'react-datepicker/dist/react-datepicker.css'

import { Databases, Teams } from 'appwrite'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import {
  appwriteEventsCollection,
  appwriteVotingDatabase,
  inputModalClassName,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import { EventDocument } from '@/lib/models/EventDocument'

export default function UpdateEventModal() {
  const [eventNewName, setEventNewName] = useState('')
  const [eventNewStartAtDateTime, setEventNewStartAtDateTime] = useState<Date>()
  const [eventToUpdate, setEventToUpdate] = useState<EventDocument>()
  const { eventIdToUpdate, setEventIdToUpdate } = useEvent()
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const teams = new Teams(client)

  useEffect(() => {
    if (eventIdToUpdate != null) {
      databases
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToUpdate)
        .then((document) => {
          const event = document as EventDocument
          setEventToUpdate(event)
          setEventNewName(event.name)
          setEventNewStartAtDateTime(new Date(event.start_at))
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdToUpdate])

  async function updateEvent() {
    if (eventNewName.length === 0) {
      toast.error('Введите название мероприятия.')
      return
    }
    if (eventNewStartAtDateTime === null) {
      toast.error('Введите дату начала мероприятия.')
      return
    }
    try {
      await teams.update(eventToUpdate!.access_moderators_team_id, `Модер. голос. ${eventNewName}`)
      await teams.update(eventToUpdate!.voting_moderators_team_id, `Модер. голос. ${eventNewName}`)
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
          start_at: eventNewStartAtDateTime?.toISOString(),
        },
      )
      setEventIdToUpdate(undefined)
      setEventNewName('')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen={eventIdToUpdate !== undefined}
      onAccept={updateEvent}
      acceptButtonName='Обновить'
      onCancel={() => setEventIdToUpdate(undefined)}
      title={`Обновить мероприятие ${eventToUpdate?.name}`}
    >
      <div className='form-control w-full pt-5'>
        <label className='label'>
          <span className='label-text'>Название</span>
        </label>
        <input
          type='text'
          placeholder={eventToUpdate?.name}
          value={eventNewName}
          onChange={(e) => setEventNewName(() => e.target.value)}
          className='z-50 block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
        <label className='label'>
          <span className='label-text'>Дата начала</span>
        </label>
        <div className='mt-1'>
          <ReactDatePicker
            selected={eventNewStartAtDateTime}
            onChange={(date) => date && setEventNewStartAtDateTime(date)}
            showTimeSelect
            timeFormat='HH:mm'
            timeIntervals={5}
            timeCaption='Время'
            dateFormat='dd.MM.yyyy HH:mm'
            className='z-50 block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
            locale='ru'
          />
        </div>
      </div>
    </Modal>
  )
}
