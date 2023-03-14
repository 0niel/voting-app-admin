import 'react-datepicker/dist/react-datepicker.css'

import { Account } from 'appwrite'
import { useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { inputModalClassName } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import fetchJson from '@/lib/fetchJson'

export default function CreateEventModal() {
  const { createEvent, setCreateEvent } = useEvent()
  const [newEventName, setNewEventName] = useState('')
  const [startAtDateTime, setStartAtDateTime] = useState<Date>()
  const { client } = useAppwrite()
  const account = new Account(client)

  async function addEventToDatabase() {
    try {
      const eventName = newEventName?.trim()
      if (eventName && eventName.length > 0) {
        const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
        await fetchJson('/api/events/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: eventName,
            jwt,
          }),
        })
        setNewEventName('')
        setCreateEvent(false)
      } else {
        toast.error('Введите название мероприятия.')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen={createEvent}
      onAccept={addEventToDatabase}
      acceptButtonName='Создать'
      onCancel={() => setCreateEvent(false)}
      title='Создать мероприятие'
    >
      <div className='form-control w-full max-w-xs pt-5'>
        <label className='label'>
          <span className='label-text'>Название</span>
        </label>
        <input
          type='text'
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          className='z-50 block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
        <label className='label'>
          <span className='label-text'>Дата начала</span>
        </label>
        <div className='mt-1'>
          <ReactDatePicker
            selected={startAtDateTime}
            onChange={(date) => date && setStartAtDateTime(date)}
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
