import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Databases, Models, Teams } from 'appwrite'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useOnClickOutside } from 'usehooks-ts'

import Modal from '@/components/modal/Modal'
import { appwriteResourcesCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useResource } from '@/context/ResourceContext'
import { mapAppwriteErroToMessage } from '@/lib/errorMessages'

export default function DeleteResourceModal() {
  const dialogPanelRef = useRef(null)
  const { resourceIdToDelete, setResourceIdToDelete } = useResource()
  const [resourceToDelete, setResourceToDelete] = useState<Models.Document>()
  const { client } = useAppwrite()
  const databases = new Databases(client)

  useOnClickOutside(dialogPanelRef, () => {
    setResourceIdToDelete(undefined)
  })

  useEffect(() => {
    try {
      if (resourceIdToDelete != null) {
        databases
          .getDocument(appwriteVotingDatabase, appwriteResourcesCollection, resourceIdToDelete)
          .then((r) => {
            setResourceToDelete(r)
          })
      }
    } catch (error: any) {
      toast.error(mapAppwriteErroToMessage(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceIdToDelete])

  async function deleteResource() {
    try {
      await databases.deleteDocument(
        appwriteVotingDatabase,
        appwriteResourcesCollection,
        resourceIdToDelete!,
      )
      setResourceIdToDelete(undefined)
    } catch (error: any) {
      toast.error(mapAppwriteErroToMessage(error.message))
    }
  }

  return (
    <Modal
      isOpen={resourceIdToDelete !== undefined}
      onAccept={deleteResource}
      acceptButtonName='Удалить'
      onCancel={() => setResourceIdToDelete(undefined)}
      title={`Удалить ресурс ${resourceToDelete?.name}`}
    >
      <div className='pt-5'>
        <div className='alert alert-warning shadow-sm'>
          <div>
            <ExclamationTriangleIcon className='h-8 w-8' />
            <span>При удалении ресурса, ссылка пропадет из бокового меню в приложении.</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
