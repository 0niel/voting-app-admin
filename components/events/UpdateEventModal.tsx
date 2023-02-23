import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Databases } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { toast } from 'react-hot-toast'
import { useUpdateEvent } from '@/context/UpdateEventContext'
import { useOnClickOutside } from 'usehooks-ts'

export default function UpdateEventModal() {
  const dialogPanelRef = useRef(null)
  const [eventName, setEventName] = useState('')
  const { eventId, setEventId } = useUpdateEvent()
  const [eventNamePlaceholder, setEventNamePlaceholder] = useState('')
  const { client } = useAppwrite()

  useOnClickOutside(dialogPanelRef, () => {
    setEventId(undefined)
  })

  useEffect(() => {
    if (eventId != null) {
      new Databases(client!)
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventId)
        .then((r) => {
          setEventNamePlaceholder(r.name)
        })
    }
  }, [eventId])

  return (
    <Transition appear show={eventId !== undefined} as={Fragment}>
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
                className='w-full max-w-md transform overflow-hidden bg-base-100 rounded-box p-6 text-left align-middle transition-all ring-1 ring-secondary'
              >
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  Изменение события
                </Dialog.Title>
                <div className='mt-2'>
                  <input
                    type='text'
                    placeholder={eventNamePlaceholder}
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className='input input-bordered input-accent w-full max-w-xs'
                  />
                </div>

                <div className='mt-4'>
                  <button
                    type='button'
                    className='btn btn-primary px-4 py-2'
                    onClick={async () => {
                      if (eventName.length > 0) {
                        new Databases(client!)
                          .updateDocument(
                            appwriteVotingDatabase,
                            appwriteEventsCollection,
                            eventId!,
                            { name: eventName },
                          )
                          .then((r) => setEventId(undefined))
                          .catch((error) => toast.error(error))
                          .finally(() => setEventName(''))
                      } else {
                        toast.error('Введите название события.')
                      }
                    }}
                  >
                    Изменить
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
