import { HandRaisedIcon } from '@heroicons/react/24/outline'
import { Databases, Query } from 'appwrite'
import dynamic from 'next/dynamic'
import { Data } from 'plotly.js'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import {
  appwriteListVotesLimit,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { VoteDocument } from '@/lib/models/VoteDocument'
import { pluralForm } from '@/lib/pluralForm'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

export default function ShowPollResultsModal() {
  const { pollIdToShowResults, setPollIdToShowResults } = usePoll()
  const [votes, setVotes] = useState<Map<string, number>>(new Map())
  const [barData, setBarData] = useState<Data[]>([])
  const [loading, setLoading] = useState(true)
  const [simpleMajority, setSimpleMajority] = useState<number>()
  const [votesSum, setVotesSum] = useState<number>()
  const { client } = useAppwrite()
  const databases = new Databases(client)

  useEffect(() => {
    const votesMap = new Map<string, number>()
    const fetchVotes = async () => {
      setLoading(true)
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

      const votesSum = Array.from(votesMap.values()).reduce((partialSum, a) => partialSum + a, 0)
      setVotesSum(votesSum)
      setSimpleMajority(Math.ceil(votesSum / 2))

      setBarData([
        {
          y: Array.from(votesMap.values()),
          x: Array.from(votesMap.keys()),
          type: 'bar',
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
        {Array.from(votes.values()).length === 0 ? (
          'Голосов нет.'
        ) : (
          <div>
            {Array.from(votes, ([voteOption, count], index) => (
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
        )}
        {!loading ? (
          <Plot
            data={barData}
            layout={{
              height: 300,
              width: 400,
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
                    width: 2,
                    dash: 'solid',
                  },
                },
              ],
            }}
            config={{ displaylogo: false }}
          />
        ) : (
          <div className='m-auto my-20 h-36 w-60 animate-pulse rounded-xl bg-gray-200' />
        )}
      </div>
      <hr className='my-3 h-0.5 border-t-0 bg-neutral-100 opacity-100' />
      <div className='flex'>
        Всего голосов:
        {loading ? (
          <div className='mt-1.5 ml-1 h-3.5 w-5 items-center justify-between rounded-full bg-gray-200' />
        ) : (
          <span className='ml-1 font-semibold'>{votesSum}</span>
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
