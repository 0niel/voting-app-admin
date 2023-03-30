import {
  ArrowPathIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  NoSymbolIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Account, Databases, Models, Query } from 'appwrite'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CopyPollModal from '@/components/events/polls/CopyPollModal'
import CountDown from '@/components/events/polls/CountDown'
import CreatePollModal from '@/components/events/polls/CreatePollModal'
import DeletePollModal from '@/components/events/polls/DeletePollModal'
import ResetVotesPollModal from '@/components/events/polls/ResetVotesPollModal'
import ShowNotVotedParticipants from '@/components/events/polls/ShowNotVotedParticipants'
import ShowPollResultsModal from '@/components/events/polls/ShowPollResultsModal'
import UpdatePollModal from '@/components/events/polls/UpdatePollModal'
import TeamsNavigation from '@/components/events/TeamsNavigation'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell, Column } from '@/components/Table'
import TableTitleWithSkeleton from '@/components/TableTitleWithSkeleton'
import Tooltip from '@/components/Tooltip'
import {
  appwriteEventsCollection,
  appwriteListPollsLimit,
  appwritePollsCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import fetchJson from '@/lib/fetchJson'
import { formatDate } from '@/lib/formatDate'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'

const columns: Column[] = [
  { title: 'id' },
  { title: 'Вопрос' },
  { title: 'Показывать только кол-во проголосовавших?' },
  { title: 'Изначальная длительность (сек.)' },
  { title: 'Начало' },
  { title: 'Конец' },
  { title: 'Варианты голосования' },
  { title: 'Голоса' },
  { title: 'Времени осталось' },
  { title: '' },
]

const PollList = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [polls, setPolls] = useState<PollDocument[]>([])
  const databases = new Databases(client)
  const account = new Account(client)
  const [event, setEvent] = useState<EventDocument>()
  const {
    setCreatePoll,
    setPollIdToUpdate,
    setPollIdToDelete,
    setPollIdToResetVotes,
    setPollIdToCopy,
    setPollIdToShowResults,
    setPollIdToShowNotVotedParticipants,
  } = usePoll()

  const [timeLeft, setTimeLeft] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      // обновляем состояние timeLeft каждую секунду
      console.log('Update timeLeft: ', timeLeft)
      setTimeLeft((prevTimeLeft) => prevTimeLeft.map((time) => time - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  useEffect(() => {
    const pollTimes = polls.map((poll) => {
      const endAt = new Date(poll.end_at!)
      const now = new Date()
      let timeLeft = endAt.getTime() - now.getTime()

      if (timeLeft < 0) {
        timeLeft = 0
      }

      console.log('Poll', poll.$id, 'timeLeft', timeLeft, 'ms')

      return Math.floor(timeLeft / 1000) // переводим в секунды
    })
    setTimeLeft(pollTimes)
  }, [polls])

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event as EventDocument)
      await updatePolls(_event.$id)
      client.subscribe(
        [`databases.${appwriteVotingDatabase}.collections.${appwritePollsCollection}.documents`],
        async (response) => {
          console.log('Received event', response.events[0], 'with payload', response.payload)
          const event = response.events[0]
          const eventAction = event.split('.').pop()

          const doc = response.payload as Models.Document

          if (doc.$collectionId === appwritePollsCollection) {
            if (doc.event_id === eventID) {
              if (eventAction === 'create') {
                setPolls((polls) => [doc as PollDocument, ...polls])
              } else if (eventAction === 'update') {
                setPolls((polls) =>
                  polls.map((poll) => {
                    if (poll.$id === doc.$id) {
                      return doc as PollDocument
                    }
                    return poll
                  }),
                )
              } else if (eventAction === 'delete') {
                setPolls((polls) => polls.filter((poll) => poll.$id !== doc.$id))
              }
            }
          }
        },
      )
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
        [Query.equal('event_id', eventID || event?.$id!), Query.limit(appwriteListPollsLimit)],
      )
      setPolls(pollList.documents.reverse() as PollDocument[])
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const setTimeEnd = (time: number, pollIdToUpdate: string) => {
    console.log('setTimeEnd', time, pollIdToUpdate)
    const timeEnd = new Date(time).toISOString()

    const startedPoll = polls.find(
      (poll) =>
        poll.$id !== pollIdToUpdate &&
        poll.start_at &&
        poll.end_at &&
        new Date(poll.start_at).getTime() < time &&
        new Date(poll.end_at).getTime() > new Date().getTime(),
    )
    if (startedPoll) {
      toast.error(`Остановите голосование «${startedPoll.question}», прежде чем продлить это.`)
      return
    }

    databases.updateDocument(appwriteVotingDatabase, appwritePollsCollection, pollIdToUpdate, {
      end_at: timeEnd,
    })
  }

  const setTimeStart = async (time: number, pollIdToUpdate: string) => {
    const pollToStart = (await databases.getDocument(
      appwriteVotingDatabase,
      appwritePollsCollection,
      pollIdToUpdate,
    )) as PollDocument
    console.log('setTimeStart', time, pollIdToUpdate)
    if (pollToStart.start_at) {
      toast.error('Голосование уже запущено.')
      return
    }

    const startedPoll = polls.find(
      (poll) =>
        poll.start_at &&
        poll.end_at &&
        poll.$id !== pollIdToUpdate &&
        new Date(poll.end_at).getTime() > time,
    )
    if (startedPoll) {
      toast.error(`Остановите голосование «${startedPoll.question}», прежде чем начинать другое.`)
      return
    }
    const timeStart = new Date(time).toISOString()
    const timeEnd = new Date(time + pollToStart.duration * 1000).toISOString()

    databases.updateDocument(appwriteVotingDatabase, appwritePollsCollection, pollIdToUpdate, {
      start_at: timeStart,
      end_at: timeEnd,
    })
  }

  const finishPoll = async (pollIDToFinish: string) => {
    const jwt = (await account.createJWT()).jwt
    await fetchJson('/api/polls/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pollID: pollIDToFinish,
        eventID,
        jwt,
      }),
    })
  }

  const rows: Cell[][] = polls.map((poll) => [
    { value: poll.$id },
    { value: poll.question },
    { value: poll.show_only_voters_count ? '✅Да' : '❌Нет' },
    { value: poll.duration },
    { value: poll.start_at ? formatDate(poll.start_at) : 'нет' },
    { value: poll.end_at ? formatDate(poll.end_at) : 'нет' },
    {
      value: (
        <ul className='list-inside list-disc'>
          {poll.poll_options.map((option: string, index: number) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      ),
    },
    { value: poll.is_finished ? '✅Подсчитаны' : '❌Промежуточные' },
    {
      value: (
        <CountDown
          isStarted={poll.start_at != undefined}
          isFinished={poll.is_finished}
          setTimeStart={setTimeStart}
          setTimeEnd={setTimeEnd}
          timeLeft={timeLeft[polls.indexOf(poll)]}
          pollId={poll.$id}
          finishPoll={finishPoll}
        />
      ),
    },
    {
      value: (
        <div className='flex space-x-2'>
          <Tooltip text='непроголосовавшие'>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setPollIdToShowNotVotedParticipants(poll.$id)}
              disabled={poll.is_finished}
            >
              <NoSymbolIcon className='h-6 w-6' />
            </button>
          </Tooltip>
          <Tooltip text='результаты'>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setPollIdToShowResults(poll.$id)}
              disabled={!poll.is_finished}
            >
              <ChartPieIcon className='h-6 w-6' />
            </button>
          </Tooltip>
          <Tooltip text='изменить'>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setPollIdToUpdate(poll.$id)}
            >
              <PencilIcon className='h-6 w-6' />
            </button>
          </Tooltip>
          <Tooltip text='скопировать'>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setPollIdToCopy(poll.$id)}
            >
              <DocumentDuplicateIcon className='h-6 w-6' />
            </button>
          </Tooltip>
          <Tooltip text='удалить голоса'>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setPollIdToResetVotes(poll.$id)}
            >
              <ArrowPathIcon className='h-6 w-6' />
            </button>
          </Tooltip>
          <button className='btn-outline btn-error btn' onClick={() => setPollIdToDelete(poll.$id)}>
            <TrashIcon className='h-6 w-6' />
          </button>
        </div>
      ),
    },
  ])

  return (
    <>
      <div className='min-h-12'>
        {event && <TeamsNavigation className='place-item-center col-span-4' event={event} />}
      </div>
      <Table
        title={
          <TableTitleWithSkeleton
            title={`Список голосований ${event?.name}`}
            isLoading={event?.name === undefined}
            skeletonSize={64}
          />
        }
        description='Создайте новое голосование, чтобы участники мероприятия смогли оставить свой голос.'
        action='Создать голосование'
        columns={columns}
        rows={rows}
        onActionClick={() => setCreatePoll(true)}
      />
      <CreatePollModal />
      <UpdatePollModal />
      <DeletePollModal />
      <ResetVotesPollModal />
      <CopyPollModal />
      <ShowPollResultsModal />
      <ShowNotVotedParticipants />
    </>
  )
}

PollList.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default PollList
