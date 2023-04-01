import { HandRaisedIcon } from '@heroicons/react/24/outline'
import { Databases, Query } from 'appwrite'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Data } from 'plotly.js'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import wrap from 'word-wrap'

import Modal from '@/components/modal/Modal'
import {
  appwriteEventsCollection,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'
import { pluralForm } from '@/lib/pluralForm'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function ShowPollResultsModal() {
  const router = useRouter()
  const { eventID } = router.query
  const { pollIdToShowResults, setPollIdToShowResults } = usePoll()
  const [event, setEvent] = useState<EventDocument>()
  const [poll, setPoll] = useState<PollDocument>()
  const [votes, setVotes] = useState<Map<string, number>>(new Map())
  const [barData, setBarData] = useState<Data[]>([])
  const [loading, setLoading] = useState(true)
  const [simpleMajority, setSimpleMajority] = useState<number>()
  const [votesCount, setVotesCount] = useState<number>()
  const { client } = useAppwrite()
  const databases = new Databases(client)

  useEffect(() => {
    const votesMap = new Map<string, number>()
    const fetchVotes = async () => {
      setLoading(true)
      const event = (await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )) as EventDocument
      setEvent(event)

      const poll = (await databases.getDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollIdToShowResults!,
      )) as PollDocument
      setPoll(poll)
      ;(
        (
          await databases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
            Query.equal('poll_id', pollIdToShowResults!),
            Query.limit(appwriteListVotesLimit),
          ])
        ).documents as VoteDocument[]
      ).forEach((vote) => {
        votesMap.set(vote.vote, (votesMap.get(vote.vote) || 0) + 1)
      })
      setVotes(votesMap)

      const votesCount = Array.from(votesMap.values()).reduce((partialSum, a) => partialSum + a, 0)
      setVotesCount(votesCount)
      let simpleMajority: number
      if (votesCount > 1 && votesCount % 2 === 0) {
        simpleMajority = Math.ceil(votesCount / 2) + 1
      } else {
        simpleMajority = Math.ceil(votesCount / 2)
      }
      setSimpleMajority(simpleMajority)

      setBarData([
        {
          y: Array.from(votesMap.values()),
          x: Array.from(votesMap.keys()),
          text: Array.from(votesMap.values()).map(String),
          type: 'bar',
          marker: {
            color: Array.from(votesMap.values()).map((vote) =>
              vote >= simpleMajority! ? 'rgb(94, 234, 212)' : 'rgb(79, 70, 229)',
            ),
          },
        },
      ])
      setLoading(false)
    }
    if (pollIdToShowResults !== undefined) {
      fetchVotes().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIdToShowResults])

  return (
    <Modal
      isOpen={pollIdToShowResults !== undefined}
      onAccept={() => setPollIdToShowResults(undefined)}
      acceptButtonName='Ок'
      onCancel={() => setPollIdToShowResults(undefined)}
      title='Результаты голосования'
      hideCancelButton={true}
    >
      <div className='p-2'>
        {!loading ? (
          Array.from(votes.values()).length === 0 ? (
            'Голосов нет.'
          ) : (
            <div>
              {Array.from(votes, ([voteOption, count]) => (
                <React.Fragment key={voteOption}>
                  <div className='my-2 flex'>
                    <HandRaisedIcon className='mt-1 mr-1 h-4 w-4' />
                    {voteOption} — <span className='mx-1 font-semibold'>{count}</span>
                    {pluralForm(count, ['голос', 'голоса', 'голосов'])}
                  </div>
                  <hr className='my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100' />
                  {/*{index !== Array.from(votes.values()).length - 1 && (*/}
                  {/*  <hr className='my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100' />*/}
                  {/*)}*/}
                </React.Fragment>
              ))}
            </div>
          )
        ) : (
          [1, 2, 3].map((_, index) => (
            <div key={index} className='animate-pulse'>
              <div className='my-2 h-3.5 w-52 rounded-full bg-gray-200' />
              <hr className='my-3 h-0.5 border-t-0 bg-neutral-100 opacity-100' />
            </div>
          ))
        )}
        <div className='min-h-[300px]'>
          {!loading ? (
            <Plot
              data={barData}
              layout={{
                title: {
                  text: wrap(`Голосование ${event?.name.trim()}\n«${poll?.question.trim()}»`, {
                    width: 45,
                    newline: '<br>',
                  }),
                  font: {
                    size: 12,
                  },
                },
                height: 300,
                width: 400,
                margin: {
                  t: 90,
                  b: 90,
                  l: 40,
                  r: 40,
                },
                uirevision: 'true',
                shapes: [
                  {
                    type: 'line',
                    xref: 'paper',
                    x0: 0,
                    y0: simpleMajority,
                    x1: 1,
                    y1: simpleMajority,
                    line: {
                      color: 'rgb(255, 0, 0)',
                      width: 3,
                      dash: 'solid',
                    },
                  },
                ],
              }}
              config={{
                displaylogo: false,
                toImageButtonOptions: {
                  filename: `Гист. голос. ${poll?.question.trim()}`,
                  height: 600,
                  width: 800,
                },
              }}
            />
          ) : (
            <div className='mx-auto my-10 h-44 w-80 animate-pulse rounded-xl bg-gray-200' />
          )}
        </div>
      </div>
      <hr className='my-2 h-0.5 border-t-0 bg-neutral-100 opacity-100' />
      <div className='flex'>
        Всего голосов:
        {loading ? (
          <div className='mt-1.5 ml-1 h-3.5 w-5 items-center justify-between rounded-full bg-gray-200' />
        ) : (
          <span className='ml-1 font-semibold'>{votesCount}</span>
        )}
      </div>
      <div className='flex'>
        Простое большинство:
        {loading ? (
          <div className='mt-1.5 ml-1 h-3.5 w-5 items-center justify-between rounded-full bg-gray-200' />
        ) : (
          <span className='ml-1 font-semibold'>{simpleMajority}</span>
        )}
      </div>
    </Modal>
  )
}
