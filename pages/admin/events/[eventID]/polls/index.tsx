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
import { EventDocument } from '@/lib/models/EventDocument'
import { pluralForm } from '@/lib/pluralForm'

const columns: Column[] = [
  { title: 'id' },
  { title: 'Вопрос' },
  { title: 'Начало' },
  { title: 'Конец' },
  { title: 'Варианты голосования' },
  { title: 'Времени осталось' },
  { title: '' },
]

const CountDown = ({
  pollId,
  timeLeft,
  setTimeEnd,
}: {
  pollId: string
  timeLeft: number
  setTimeEnd: (time: number, pollId: string) => void
}) => {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0)

  useEffect(() => {
    setCurrentTimeLeft(timeLeft)
  }, [timeLeft])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTimeLeft > 0) {
        setDays(Math.floor(timeLeft / (60 * 60 * 24)))
        setHours(Math.floor((timeLeft / (60 * 60)) % 24))
        setMinutes(Math.floor((timeLeft / 60) % 60))
        setSeconds(Math.floor(timeLeft % 60))
      }
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeLeft])

  const handleAddTime = (secondsToAdd: number) => {
    updateTimeLeft(currentTimeLeft + secondsToAdd)
  }

  const handleStop = () => {
    updateTimeLeft(0)
  }

  const updateTimeLeft = (newTimeLeft: number) => {
    setCurrentTimeLeft(newTimeLeft)
    if (newTimeLeft > 0) {
      setTimeEnd(Date.now() + newTimeLeft * 1000, pollId)
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <div className='flex items-center'>
        {days > 0 && (
          <>
            {days} {pluralForm(days, ['день', 'дня', 'дней'])}{' '}
          </>
        )}
        {hours > 0 && (
          <>
            {hours} {pluralForm(hours, ['час', 'часа', 'часов'])}{' '}
          </>
        )}
        {minutes > 0 && (
          <>
            {minutes} {pluralForm(minutes, ['минута', 'минуты', 'минут'])}{' '}
          </>
        )}
        {seconds > 0 && (
          <>
            {seconds} {pluralForm(seconds, ['секунда', 'секунды', 'секунд'])}{' '}
          </>
        )}
      </div>
      <div className='flex items-center'>
        <ul className='flex'>
          <li>
            <button className='btn-ghost btn' onClick={() => handleAddTime(30)}>
              +30 сек
            </button>
          </li>
          <li>
            <button className='btn-ghost btn' onClick={() => handleAddTime(60)}>
              +1 мин
            </button>
          </li>
          <li>
            <button className='btn-ghost btn' onClick={() => handleAddTime(300)}>
              +5 мин
            </button>
          </li>
          <li>
            <button className='btn-ghost btn' onClick={() => handleStop()}>
              Стоп
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

const PollList = () => {
  const { client } = useAppwrite()
  const router = useRouter()
  const { eventID } = router.query
  const [polls, setPolls] = useState<Models.Document[]>([])
  const databases = new Databases(client)
  const [event, setEvent] = useState<EventDocument>()
  const { setCreatePoll, setPollIdToUpdate, setPollIdToDelete } = usePoll()

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
      const startAt = new Date(poll.start_at)
      const endAt = new Date(poll.end_at)
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
              setPolls((polls) => [doc, ...polls])
            } else if (eventAction === 'update') {
              setPolls((polls) =>
                polls.map((poll) => {
                  if (poll.$id === doc.$id) {
                    return doc
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event as EventDocument)
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

  const setTimeEnd = (time: number, pollIdToUpdate: string) => {
    console.log('setTimeEnd', time, pollIdToUpdate)
    const timeEnd = new Date(time).toISOString()

    databases.updateDocument(appwriteVotingDatabase, appwritePollsCollection, pollIdToUpdate, {
      end_at: timeEnd,
    })
  }

  const rows: Cell[][] = polls.map((poll: Models.Document) => [
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
        <CountDown
          pollId={poll.$id}
          setTimeEnd={setTimeEnd}
          timeLeft={timeLeft[polls.indexOf(poll)]}
        />
      ),
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
      {event && <TeamsNavigation className='place-item-center col-span-4' event={event} />}
      <Table
        title={`Список голосований ${event?.name}`}
        description='Создайте новое голосование, чтобы участники мероприятия смогли оставить свой голос.'
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
