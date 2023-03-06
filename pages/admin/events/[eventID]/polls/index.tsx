import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Databases, Models, Query, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CreatePollModal from '@/components/events/polls/CreatePollModal'
import DeletePollModal from '@/components/events/polls/DeletePollModal'
import UpdatePollModal from '@/components/events/polls/UpdatePollModal'
import TeamsNavigation from '@/components/events/TeamsNavigation'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell, Column } from '@/components/Table'
import {
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { formatDate } from '@/lib/formatDate'

const columns: Column[] = [
  { title: 'id' },
  { title: 'Вопрос' },
  { title: 'Начало' },
  { title: 'Конец' },
  { title: 'Варианты голосования' },
  { title: '' },
]

const PollList = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [polls, setPolls] = useState<Models.Document[]>([])
  const databases = new Databases(client)
  const [event, setEvent] = useState<Models.Document>()
  const { setCreatePoll, setPollIdToUpdate, setPollIdToDelete } = usePoll()

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event)
      await updatePolls(_event.$id)
      client.subscribe('documents', async (response) => {
        await updatePolls(_event.$id)
      })
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function updatePolls(eventID?: string) {
    try {
      const pollList = await databases.listDocuments(
        appwriteVotingDatabase,
        appwritePollsCollection,
        [Query.equal('event_id', eventID || event?.$id!)],
      )
      setPolls(pollList.documents.reverse())
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const rows: Cell[][] = polls.map((poll) => [
    { value: poll.$id },
    { value: poll.question },
    { value: formatDate(poll.start_at) },
    { value: formatDate(poll.end_at) },
    {
      value: poll.poll_options.map((option: string, index: number) => (
        <li key={index}>{option}</li>
      )),
    },
    {
      value: (
        <div className='flex space-x-2'>
          <button
            className='btn-outline btn-secondary btn'
            onClick={() => setPollIdToUpdate(poll.$id)}
          >
            <PencilIcon className='h-6 w-6' />
          </button>
          <button
            className='btn-outline btn-secondary btn'
            onClick={() => setPollIdToDelete(poll.$id)}
          >
            <TrashIcon className='h-6 w-6' />
          </button>
        </div>
      ),
    },
  ])

  return (
    <>
      <TeamsNavigation className='place-item-center col-span-4' event={event} />
      <Table
        title='Список голосований'
        description={`Голосования ${event?.name}`}
        action='Создать голосование'
        columns={columns}
        rows={rows}
        onActionClick={() => setCreatePoll(true)}
      />
      <CreatePollModal />
      <UpdatePollModal />
      <DeletePollModal />
    </>
  )
}

PollList.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default PollList
