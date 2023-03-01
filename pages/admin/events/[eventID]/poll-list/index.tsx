import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Databases, Models } from 'appwrite'
import {
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { toast } from 'react-hot-toast'
import { useAppwrite } from '@/context/AppwriteContext'
import TeamsNavigation from '@/components/teams/TeamsNavigation'
import PanelWindow from '@/components/PanelWindow'
import { formatDate } from '@/lib/formatDate'
import DeleteMembershipModal from '@/components/teams/DeleteMembershipModal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const PollList = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [polls, setPolls] = useState<Models.Document[]>([])
  const databases = new Databases(client)
  const [event, setEvent] = useState<Models.Document>()
  const [votingModeratorsTeamID, setVotingModeratorsTeamID] = useState<string>()

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event)
      const _teamID = _event.voting_moderators_team_id
      setVotingModeratorsTeamID(_teamID)
      updatePolls(_teamID)
      client.subscribe('documents', async (response) => {
        updatePolls()
      })
    }
    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  function updatePolls(_votingModeratorsTeamID?: string) {
    databases
      .listDocuments(appwriteVotingDatabase, appwritePollsCollection)
      .then((pollList) => setPolls(pollList.documents.reverse()))
      .catch((error) => toast.error(error.message))
  }

  return (
    <>
      <h1 className='p-1 text-start text-2xl text-base-content md:text-center'>
        <span className='text-neutral'>Событие</span>
        <span className='pl-1 font-bold'>{event?.name}</span>
      </h1>
      <TeamsNavigation className='place-item-center col-span-4' event={event} />
      <div className='grid grid-flow-row-dense grid-cols-4 place-items-stretch gap-4 px-3'>
        <PanelWindow className='col-span-4 row-span-4'>
          <div className='overflow-x-auto'>
            <table className='w-full table-auto md:table-fixed'>
              <thead>
                <tr>
                  <th className='bg-base-200' />
                  <th className='bg-base-200'>Вопрос</th>
                  <th className='bg-base-200'>Начало</th>
                  <th className='bg-base-200'>Конец</th>
                  <th className='bg-base-200'>Варианты голосования</th>
                  <th className='bg-base-200' />
                </tr>
              </thead>
              <tbody>
                {polls.map((poll, index) => (
                  <tr key={index}>
                    <th className='border-b border-slate-100 text-xs font-light'>
                      {poll.$id.slice(-7)}
                    </th>
                    <td className='max-w-[30rem] border-b'>{poll.question}</td>
                    <td className='border-b'>
                      <div className='flex items-center justify-center'>
                        {formatDate(poll.start_at)}
                      </div>
                    </td>
                    <td className='border-b'>
                      <div className='flex items-center justify-center'>
                        {formatDate(poll.end_at)}
                      </div>
                    </td>
                    <td className='max-w-[30rem] border-b'>
                      <ul className='list-disc'>
                        {poll.poll_options.map((option: string, index: number) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </td>
                    <td className='border-b'>
                      <div className='flex items-center justify-center'>
                        <button className='hover:text-info'>
                          <PencilIcon className='mr-1 h-5 w-5' />
                        </button>
                        <button className='hover:text-error'>
                          <TrashIcon className='h-5 w-5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelWindow>
      </div>
      <DeleteMembershipModal />
    </>
  )
}

PollList.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default PollList
