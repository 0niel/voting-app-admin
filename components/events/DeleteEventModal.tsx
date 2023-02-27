import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Databases, Models, Teams } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { toast } from 'react-hot-toast'
import { useEvent } from '@/context/EventContext'
import { useOnClickOutside } from 'usehooks-ts'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DeleteEventModal() {
  const dialogPanelRef = useRef(null)
  const { eventIdToDelete, setEventIdToDelete } = useEvent()
  const [eventToDelete, setEventToDelete] = useState<Models.Document>()
  const { client } = useAppwrite()

  useOnClickOutside(dialogPanelRef, () => {
    setEventIdToDelete(undefined)
  })

  useEffect(() => {
    try {
      if (eventIdToDelete != null) {
        new Databases(client)
          .getDocument(appwriteVotingDatabase, appwriteEventsCollection, eventIdToDelete)
          .then((r) => {
            setEventToDelete(r)
          })
      }
    } catch (error: any) {
      toast.error(error.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdToDelete])

  async function deleteEvent() {
    try {
      await new Teams(client!).delete(eventToDelete!.access_moderators_team_id)
      await new Teams(client!).delete(eventToDelete!.voting_moderators_team_id)
      await new Teams(client!).delete(eventToDelete!.participants_team_id)
      await new Databases(client!).deleteDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventIdToDelete!,
      )
      setEventIdToDelete(undefined)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

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
                className='rounded-box w-full max-w-md transform overflow-hidden bg-base-100 p-6 text-left align-middle ring-1 ring-secondary transition-all hover:ring-2 hover:ring-secondary-focus'
              >
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  <span>Вы уверены, что хотите удалить событие </span>
                  <span className='text-primary'>
                    {eventToDelete?.name}
                    <span className='text-sm font-light'> {eventToDelete?.$id.slice(-7)}</span>
                  </span>
                  ?
                </Dialog.Title>
                <div className='pt-5'>
                  <div className='alert alert-warning shadow-lg'>
                    <div>
                      <ExclamationTriangleIcon className='h-8 w-8' />
                      <span>
                        При удалении события списки модераторов доступа и голосования, участников
                        также будут удалены.
                      </span>
                    </div>
                  </div>
                </div>
                <div className='mt-6 flex justify-end'>
                  <div className='mr-2'>
                    <button
                      type='button'
                      className='btn-primary btn'
                      onClick={() => setEventIdToDelete(undefined)}
                    >
                      Отменить
                    </button>
                  </div>
                  <button type='button' className='btn-outline btn-error btn' onClick={deleteEvent}>
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