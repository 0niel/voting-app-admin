import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Databases, Models, Teams } from 'appwrite'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useOnClickOutside } from 'usehooks-ts'

import Modal from '@/components/modal/Modal'
import { appwriteEventsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import { mapAppwriteErrorToMessage } from '@/lib/errorMessages'

export default function DeleteEventModal() {
  const dialogPanelRef = useRef(null)
  const { eventIdToDelete, setEventIdToDelete } = useEvent()
  const [eventToDelete, setEventToDelete] = useState<Models.Document>()
  const { client } = useAppwrite()
  const teams = new Teams(client)
  const databases = new Databases(client)

  useOnClickOutside(dialogPanelRef, () => {
    setEventIdToDelete(undefined)
  })

  useEffect(() => {
    try {
      if (eventIdToDelete != null) {
        databases
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
      await teams.delete(eventToDelete!.access_moderators_team_id)
    } catch (error: any) {
      toast.error(mapAppwriteErrorToMessage(error.message))
    }
    try {
      await teams.delete(eventToDelete!.voting_moderators_team_id)
    } catch (error: any) {
      toast.error(mapAppwriteErrorToMessage(error.message))
    }
    try {
      await teams.delete(eventToDelete!.participants_team_id)
    } catch (error: any) {
      toast.error(mapAppwriteErrorToMessage(error.message))
    }
    try {
      await databases.deleteDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventIdToDelete!,
      )
      setEventIdToDelete(undefined)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  function setOpen(open: boolean) {
    if (!open) {
      setEventIdToDelete(undefined)
    }
  }

  return (
    <Modal
      isOpen={eventIdToDelete !== undefined}
      onAccept={deleteEvent}
      acceptButtonName='Удалить'
      onCancel={() => setEventIdToDelete(undefined)}
      title={`Удалить мероприятие ${eventToDelete?.name}`}
    >
      <div className='pt-5'>
        <div className='alert alert-warning shadow-sm'>
          <div>
            <ExclamationTriangleIcon className='h-8 w-8' />
            <span>
              При удалении мероприятия списки модераторов доступа и голосования, участников также
              будут удалены.
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
