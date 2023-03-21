import { Databases, Query } from 'appwrite'
import { ArcElement, Chart, Legend, Tooltip } from 'chart.js'
import React, { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
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

Chart.register(ArcElement, Tooltip, Legend)

export default function ShowPollResultsModal() {
  const { pollIdToShowResults, setPollIdToShowResults } = usePoll()
  const [votes, setVotes] = useState<Map<string, number>>(new Map())
  const [pieData, setPieData] = useState<object>()
  const { client } = useAppwrite()
  const databases = new Databases(client)

  useEffect(() => {
    const votesMap = new Map<string, number>()
    const fetchVotes = async () => {
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
      setPieData({
        labels: Array.from(votesMap.keys()),
        datasets: [
          {
            label: 'голосов',
            data: Array.from(votesMap.values()),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      })
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
          <ul className='list-inside list-disc'>
            {Array.from(votes, ([voteOption, count]) => {
              return (
                <li
                  key={voteOption}
                  className={Math.max(...Array.from(votes.values())) === count ? 'text-accent' : ''}
                >
                  {voteOption} — {count} гол.
                </li>
              )
            })}
          </ul>
        )}
        {pieData && (
          <Pie
            className='h-15 w-15 p-2' // @ts-ignore
            data={pieData}
          />
        )}
      </div>
    </Modal>
  )
}
