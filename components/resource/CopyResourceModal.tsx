import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Account, Databases, ID, Models, Teams } from 'appwrite'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useOnClickOutside } from 'usehooks-ts'

import Modal from '@/components/modal/Modal'
import { appwriteResourcesCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useResource } from '@/context/ResourceContext'
import { mapAppwriteErrorToMessage } from '@/lib/errorMessages'
import fetchJson from '@/lib/fetchJson'

export default function CopyResourceModal() {
  const dialogPanelRef = useRef(null)
  const { resourceIdToCopy, setResourceIdToCopy } = useResource()
  const [resourceToCopy, setResourceToCopy] = useState<Models.Document>()
  const { client } = useAppwrite()
  const databases = new Databases(client)
  const account = new Account(client)

  useOnClickOutside(dialogPanelRef, () => {
    setResourceIdToCopy(undefined)
  })

  useEffect(() => {
    try {
      if (resourceIdToCopy != null) {
        databases
          .getDocument(appwriteVotingDatabase, appwriteResourcesCollection, resourceIdToCopy)
          .then((r) => {
            setResourceToCopy(r)
          })
      }
    } catch (error: any) {
      toast.error(mapAppwriteErrorToMessage(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceIdToCopy])

  async function copyResource() {
    try {
      await databases.createDocument(
        appwriteVotingDatabase,
        appwriteResourcesCollection,
        ID.unique(),
        {
          name: resourceToCopy?.name + ' (копия)',
          url: resourceToCopy?.url,
          event_id: resourceToCopy?.event_id,
          svg_icon: resourceToCopy?.svg_icon,
        },
      )
      setResourceIdToCopy(undefined)
    } catch (error: any) {
      toast.error(mapAppwriteErrorToMessage(error.message))
    }
  }

  return (
    <Modal
      isOpen={resourceIdToCopy !== undefined}
      onAccept={copyResource}
      acceptButtonName='Скопировать'
      onCancel={() => setResourceIdToCopy(undefined)}
      title={`Скопировать ресурс ${resourceToCopy?.name}`}
    />
  )
}
