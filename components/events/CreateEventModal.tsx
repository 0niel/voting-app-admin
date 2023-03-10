import { Account } from 'appwrite'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import fetchJson from '@/lib/fetchJson'

export default function CreateEventModal() {
  const { createEvent, setCreateEvent } = useEvent()
  const [newEventName, setNewEventName] = useState('')
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
        toast.error('Введите название события.')
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
      title='Создать событие'
    >
      <div className='form-control w-full max-w-xs pt-5'>
        <label className='label'>
          <span className='label-text'>Название</span>
        </label>
        <input
          type='text'
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
      </div>
    </Modal>
  )
}
