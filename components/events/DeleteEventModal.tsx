import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Databases, Models } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { toast } from 'react-hot-toast'
import { useEvent } from '@/context/EventContext'
import { useOnClickOutside } from 'usehooks-ts'

export default function DeleteEventModal() {
  const dialogPanelRef = useRef(null)
  const { eventIdToDelete, setEventIdToDelete } = useEvent()
  const [eventToDelete, setEventToDelete] = useState<Models.Document>()
  const { client } = useAppwrite()

  useOnClickOutside(dialogPanelRef, () => {
    setEventIdToDelete(undefined)
  })

  useEffect(() => {
    if (eventIdToDelete != null) {
      new Databases(client!)
        .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToDelete)
        .then((r) => {
          setEventToDelete(r)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdToDelete])

  return (
    <Transition appear show={eventIdToDelete !== undefined} as={Fragment}>
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
                  Вы уверены, что хотите удалить событие{' '}
                  <span className='text-info'>
                    {eventToDelete?.name}
                    <span className='font-light text-sm'> {eventToDelete?.$id.slice(-7)}</span>
                  </span>
                </Dialog.Title>

                <div className='mt-6 justify-end flex'>
                  <div className='mr-2'>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={() => setEventIdToDelete(undefined)}
                    >
                      Отменить
                    </button>
                  </div>
                  <button
                    type='button'
                    className='btn btn-error btn-outline'
                    onClick={async () => {
                      new Databases(client!)
                        .deleteDocument(
                          appwriteVotingDatabase,
                          appwriteEventsCollection,
                          eventIdToDelete!,
                        )
                        .then(() => setEventIdToDelete(undefined))
                        .catch((error) => toast.error(error))
                    }}
                  >
                    Удалить
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
