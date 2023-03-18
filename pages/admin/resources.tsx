import {DocumentDuplicateIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/outline'
import { Databases } from 'appwrite'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import CreateResourceModal from '@/components/resource/CreateResourceModal'
import DeleteResourceModal from '@/components/resource/DeleteResourceModal'
import Table, { Cell, Column } from '@/components/Table'
import { appwriteResourcesCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useResource } from '@/context/ResourceContext'
import { ResourceDocument } from '@/lib/models/ResourceDocument'
import UpdateResourceModal from '@/components/resource/UpdateResourceModal'
import CopyResourceModal from '@/components/resource/CopyResourceModal'

const Resources = () => {
  const { setCreateResource, setResourceIdToDelete, setResourceIdToUpdate, setResourceIdToCopy } = useResource()

  const { client } = useAppwrite()
  const databases = new Databases(client)

  const [resources, setResources] = useState<ResourceDocument[]>([])

  async function updateResourcesList() {
    setResources(
      (await databases.listDocuments(appwriteVotingDatabase, appwriteResourcesCollection))
        .documents as ResourceDocument[],
    )
  }

  useEffect(() => {
    const subscribe = async function () {
      await updateResourcesList()
      client.subscribe('documents', (response) => {
        if (
          // @ts-ignore
          response.payload!.$databaseId === appwriteVotingDatabase &&
          // @ts-ignore
          response.payload!.$collectionId === appwriteResourcesCollection
        ) {
          updateResourcesList()
        }
      })
    }
    subscribe().catch((error) => toast.error(error.message))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns: Column[] = [
    { title: 'id' },
    { title: 'Название' },
    { title: 'Ссылка' },
    { title: 'Мероприятие' },
    { title: 'Иконка' },
    { title: '' },
  ]

  const rows: Cell[][] = resources.map((resource) => [
    { value: resource.$id },
    { value: resource.name },
    {
      value: resource.url,
      onClick: () => {
        window.open(resource.url)
      },
      className: 'text-blue-500 hover:text-blue-700 cursor-pointer underline after:content-["_↗"]',
    },
    { value: resource.event_id ?? '-' },
    { value: <div dangerouslySetInnerHTML={{ __html: resource.svg_icon }} /> },
    {
      value: (
        <div className='flex space-x-2'>
          <button
            className='btn-outline btn-secondary btn'
            onClick={() => setResourceIdToUpdate(resource.$id)}
          >
            <PencilIcon className='h-6 w-6' />
          </button>
          <button
            className='btn-outline btn-secondary btn'
            onClick={() => setResourceIdToCopy(resource.$id)}
          >
            <DocumentDuplicateIcon className='h-6 w-6' />
          </button>
          <button
            className='btn-outline btn-secondary btn'
            onClick={() => setResourceIdToDelete(resource.$id)}
          >
            <TrashIcon className='h-6 w-6' />
          </button>
        </div>
      ),
    },
  ])

  return (
    <>
      <Table
        columns={columns}
        rows={rows}
        title='Список ресурсов'
        description='Ресурсы - это ссылки на внешние ресурсы, которые могут быть полезными для участников мероприятия. Они отображаются в выдвижной панели мобильного приложения.'
        action='Добавить ресурс'
        onActionClick={() => setCreateResource(true)}
      />
      <CreateResourceModal />
      <CopyResourceModal />
      <UpdateResourceModal />
      <DeleteResourceModal />
    </>
  )
}

Resources.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Resources
