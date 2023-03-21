import { Databases, Models, Query, Teams } from 'appwrite'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import {
  appwriteEventsCollection,
  appwriteListPollsLimit,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'

const BarChart = ({ data }: { data: { name: string; votes: number }[] }): ReactElement => {
  const totalVotes = data.reduce((acc, option) => acc + option.votes, 0)
  return (
    <div className='flex items-center justify-center'>
      <div className='w-full max-w-4xl rounded-md bg-white p-4 '>
        {data.map((option) => (
          <div key={option.name} className='mb-4'>
            <div className='flex items-center justify-between'>
              <span
                className='text-lg font-medium text-gray-700
              '
              >
                {option.name}
              </span>
              <span className='text-2xl font-bold text-gray-700'>{option.votes}</span>
            </div>
            <div className='mt-1 h-4 rounded-md bg-gray-300'>
              <div
                className='h-4 rounded-md bg-blue-500'
                style={{ width: `${(option.votes / totalVotes) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Realtime = () => {
  const { client } = useAppwrite()
  const databases = new Databases(client)

  const router = useRouter()
  const { eventID } = router.query

  const [event, setEvent] = useState<EventDocument>()
  const [poll, setPoll] = useState<PollDocument | null>(null)
  const [votes, setVotes] = useState<VoteDocument[]>([])
  const [timeLeft, setTimeLeft] = useState(0)

  const getActiveOrLastPoll = (polls: PollDocument[]) => {
    const now = new Date()

    const activePoll = polls.find((poll) => {
      if (poll.start_at && poll.end_at) {
        const startAt = new Date(poll.start_at)
        const endAt = new Date(poll.end_at)
        return now >= startAt && now <= endAt
      } else {
        return false
      }
    })

    if (activePoll) {
      return activePoll
    }

    if (polls.length > 0) {
      return polls[0]
    }

    return null
  }

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event as EventDocument)

      const _polls = (await databases.listDocuments(
        appwriteVotingDatabase,
        appwritePollsCollection,
        [Query.equal('event_id', eventID as string), Query.limit(appwriteListPollsLimit)],
      )) as { documents: PollDocument[] }
      const _poll = getActiveOrLastPoll(_polls.documents)
      setPoll(_poll)
      console.log('We have poll: ', _poll)

      if (_poll) {
        console.log('Poll ID: ', _poll.$id)
        const _votes = (await databases.listDocuments(
          appwriteVotingDatabase,
          appwriteVotesCollection,
          [Query.equal('poll_id', _poll.$id), Query.limit(appwriteListVotesLimit)],
        )) as { documents: VoteDocument[] }
        console.log('Votes: ', _votes.documents)
        setVotes(_votes.documents)
      }
    }

    if (router.isReady) {
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    if (poll && poll.start_at && poll.end_at) {
      const startAt = new Date(poll.start_at)
      const endAt = new Date(poll.end_at)
      const now = new Date()

      console.log('Times [startAt, endAt, now]: ', [startAt, endAt, now])

      if (now >= startAt && now <= endAt) {
        setTimeLeft(endAt.getTime() - now.getTime())
      } else {
        setTimeLeft(0)
      }

      const interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1000)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [poll])

  useEffect(() => {
    client.subscribe(
      [
        `databases.${appwriteVotingDatabase}.collections.${appwritePollsCollection}.documents`,
        `databases.${appwriteVotingDatabase}.collections.${appwriteVotesCollection}.documents`,
      ],
      async (response) => {
        const event = response.events[0]
        const eventAction = event.split('.').pop()

        if (eventAction === 'create' || eventAction === 'update' || eventAction === 'delete') {
          const doc = response.payload as Models.Document

          if (doc.$collectionId === appwritePollsCollection) {
            if (doc.event_id === eventID) {
              const _polls = (await databases.listDocuments(
                appwriteVotingDatabase,
                appwritePollsCollection,
                [Query.equal('event_id', eventID as string), Query.limit(appwriteListPollsLimit)],
              )) as { documents: PollDocument[] }
              setPoll(getActiveOrLastPoll(_polls.documents))
            }
          }

          if (doc.$collectionId === appwriteVotesCollection) {
            if (doc.poll_id === poll?.$id) {
              // в зависимости от ивента (update, create, delete) обновляем список голосов
              // если документ изменился, то надо найти его в массиве и обновить
              // если документ удален, то надо найти его в массиве и удалить
              // если документ создан, то надо добавить его в массив

              const index = votes.findIndex((vote) => vote.$id === doc.$id)

              if (index > -1) {
                if (eventAction === 'update') {
                  const _votes = [...votes]
                  _votes[index] = doc as VoteDocument
                  setVotes(_votes)
                  console.log('Votes: ', _votes)
                }

                if (eventAction === 'delete') {
                  const _votes = [...votes]
                  _votes.splice(index, 1)
                  setVotes(_votes)
                  console.log('Votes: ', _votes)
                }

                if (eventAction === 'create') {
                  const _votes = [...votes]
                  _votes.push(doc as VoteDocument)
                  setVotes(_votes)
                  console.log('Votes: ', _votes)
                }
              } else {
                if (eventAction === 'create' || eventAction === 'update') {
                  const _votes = [...votes]
                  _votes.push(doc as VoteDocument)
                  setVotes(_votes)
                  console.log('Votes: ', _votes)
                }
              }
            }
          }
        }
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, poll, votes])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100'>
      {poll && (
        <div className='w-full max-w-3xl rounded-lg bg-white px-4 py-8 shadow-lg'>
          <h1 className='mb-4 text-center text-3xl font-bold text-gray-900'>{poll?.question}</h1>
          <p className='mb-8 text-gray-700'>{poll.description}</p>
          {timeLeft > 0 && (
            <p className='mb-4 text-center font-bold text-gray-700'>
              До окончания: {Math.floor(timeLeft / 1000 / 60)} минут{' '}
              {Math.floor((timeLeft / 1000) % 60)} секунд
            </p>
          )}
          <div className='mb-4 text-center text-gray-700'>
            {poll.end_at && new Date().getTime() > new Date(poll.end_at).getTime() && (
              <p>Голосование завершено 🎉</p>
            )}
            {!poll.start_at && <p>Голосование не начато.</p>}
          </div>
          {Array.from(new Set([votes.map((vote) => vote.vote), ...poll.poll_options])) && (
            <>
              <h2 className='mb-2 text-lg font-bold text-gray-900'>{poll.name}</h2>
              <BarChart
                data={Array.from(
                  new Set([...votes.map((vote) => vote.vote), ...poll.poll_options]),
                ).map((option) => ({
                  name: option,
                  votes: votes.filter((vote) => vote.vote === option).length,
                }))}
              />
            </>
          )}
        </div>
      )}
      {!poll && (
        <div className='w-full max-w-3xl rounded-lg bg-white px-4 py-8 shadow-lg'>
          <h1 className='mb-4 text-center text-3xl font-bold text-gray-900'>{event?.name}</h1>
          <p className='mb-4 text-center text-lg text-gray-900'>
            В данный момент нет активных голосований
          </p>
        </div>
      )}
    </div>
  )
}

export default Realtime
