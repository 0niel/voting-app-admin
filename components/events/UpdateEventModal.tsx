import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Databases, Models } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { toast } from 'react-hot-toast'
import { useEvent } from '@/context/EventContext'
import { useOnClickOutside } from 'usehooks-ts'

export default function UpdateEventModal() {
  const dialogPanelRef = useRef(null)
  const [newEventName, setNewEventName] = useState('')
  const [eventToUpdate, setEventToUpdate] = useState<Models.Document>()
  const { eventIdToUpdate, setEventIdToUpdate } = useEvent()
  const { client } = useAppwrite()

  useOnClickOutside(dialogPanelRef, () => {
    setEventIdToUpdate(undefined)
  })

  useEffect(() => {
    if (eventIdToUpdate != null) {
      new Databases(client!)
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToUpdate)
        .then((event) => {
          setEventToUpdate(event)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdToUpdate])

  return (
    <Transition appear show={eventIdToUpdate !== undefined} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel
                ref={dialogPanelRef}
                className='w-full max-w-md transform overflow-hidden bg-base-100 rounded-box p-6 text-left align-middle transition-all ring-1 ring-secondary hover:ring-2 hover:ring-secondary-focus'
              >
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  Редактировать событие{' '}
                  <span className='text-info'>
                    {eventToUpdate?.name}
                    <span className='font-light text-sm'> {eventToUpdate?.$id.slice(-7)}</span>
                  </span>
                </Dialog.Title>
                <div className='form-control w-full max-w-xs pt-5'>
                  <label className='label'>
                    <span className='label-text'>Название</span>
                  </label>
                  <input
                    type='text'
                    placeholder={eventToUpdate?.name}
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className='input input-bordered input-accent w-full max-w-xs'
                  />
                </div>

                <div className='mt-6 text-end'>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={async () => {
                      if (newEventName.length > 0) {
                        new Databases(client!)
                          .updateDocument(
                            appwriteVotingDatabase,
                            appwriteEventsCollection,
                            eventIdToUpdate!,
                            { name: newEventName },
                          )
                          .then(() => setEventIdToUpdate(undefined))
                          .catch((error) => toast.error(error))
                          .finally(() => setNewEventName(''))
                      } else {
                        toast.error('Введите название события.')
                      }
                    }}
                  >
                    Сохранить
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
