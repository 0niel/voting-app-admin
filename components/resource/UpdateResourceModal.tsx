import 'react-datepicker/dist/react-datepicker.css'

import { Account, Databases, ID, Query } from 'appwrite'
import { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import {
  appwriteEventsCollection,
  appwriteListEventsLimit,
  appwritePollsCollection,
  appwriteResourcesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useResource } from '@/context/ResourceContext'
import { mapAppwriteErroToMessage } from '@/lib/errorMessages'
import fetchJson from '@/lib/fetchJson'
import { isValidPoll } from '@/lib/isValidPoll'
import { isValidResource } from '@/lib/isValidResource'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import { ResourceDocument } from '@/lib/models/ResourceDocument'

export default function UpdateResourceModal() {
  const { resourceIdToUpdate, setResourceIdToUpdate } = useResource()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [eventId, setEventId] = useState<string | null>(null)
  const [svgIcon, setSvgIcon] = useState('')

  const [events, setEvents] = useState<EventDocument[]>([])

  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)

  const feather = require('feather-icons')
  const iconNames = Object.keys(feather.icons)

  useEffect(() => {
    const fetchEvents = async () => {
      const _events = await databases.listDocuments(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        [Query.limit(appwriteListEventsLimit)],
      )

      setEvents(_events.documents as EventDocument[])
    }
    fetchEvents().catch((error) => toast.error(error.message))

    const fetchResource = async () => {
      const resource = (await databases.getDocument(
        appwriteVotingDatabase,
        appwriteResourcesCollection,
        resourceIdToUpdate!,
      )) as ResourceDocument
      setName(resource.name)
      setUrl(resource.url)
      setEventId(resource.event_id)
      setSvgIcon(resource.svg_icon)
    }

    if (resourceIdToUpdate !== undefined) {
      fetchResource().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceIdToUpdate])

  async function updateResourceInDatabase() {
    if (!isValidResource(name!, url!, svgIcon!)) {
      return
    }
    const jwt = (await account.createJWT()).jwt
    await fetchJson('/api/resources/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        url: url,
        eventId: eventId,
        svgIcon: feather.icons[svgIcon].toSvg(),
        resourceID: resourceIdToUpdate,
        jwt,
      }),
    })
    setResourceIdToUpdate(undefined)
  }

  const [searchTerm, setSearchTerm] = useState('')

  const filteredIcons = iconNames.filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Modal
      isOpen={resourceIdToUpdate !== undefined}
      onAccept={updateResourceInDatabase}
      acceptButtonName='Обновить'
      onCancel={() => setResourceIdToUpdate(undefined)}
      title='Обновить ресурс'
    >
      <div className='form-control w-full pt-5'>
        <label className='label'>
          <span className='label-text'>Название</span>
        </label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
      </div>
      <div className='form-control w-full pt-5'>
        <label className='label'>
          <span className='label-text'>Ссылка</span>
        </label>
        <input
          type='text'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className='block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
      </div>
      <div className='form-control w-full pt-5'>
        <label className='label'>
          <span className='label-text'>Мероприятие</span>
        </label>
        <select
          value={(eventId as string) || ''}
          onChange={(e) => setEventId(e.target.value)}
          className='block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        >
          <option value={''}>Нет</option>
          {events.map((event) => (
            <option key={event.$id} value={event.$id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>
      <div className='form-control w-full pt-5'>
        <label className='label'>
          <span className='label-text'>Иконка</span>
        </label>
        <div className='h-64 overflow-y-scroll'>
          <input
            type='text'
            placeholder='Поиск иконки'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='block h-auto w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
          />
          <div className='mt-4 grid grid-cols-4 gap-4'>
            {filteredIcons.map((iconName) => (
              <div
                key={iconName}
                className={`${
                  svgIcon === iconName ? 'bg-secondary text-white' : 'bg-gray-50 text-neutral'
                } flex cursor-pointer flex-col items-center justify-center rounded-lg p-2.5`}
                onClick={() => setSvgIcon(iconName)}
              >
                <div
                  className='h-8 w-8'
                  dangerouslySetInnerHTML={{
                    __html: feather.icons[iconName].toSvg({
                      class: 'w-full h-full',
                    }),
                  }}
                />
                <div className='text-xs'>{iconName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
