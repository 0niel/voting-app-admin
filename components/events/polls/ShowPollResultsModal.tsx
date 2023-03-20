import { Databases, Query } from 'appwrite'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwriteVotesCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { VoteDocument } from '@/lib/models/VoteDocument'

export default function ShowPollResultsModal() {
  const { pollIdToShowResults, setPollIdToShowResults } = usePoll()
  const [votes, setVotes] = useState<Map<string, number>>(new Map())
  const { client } = useAppwrite()
  const databases = new Databases(client)

  useEffect(() => {
    const votesMap = new Map<string, number>()
    const fetchVotes = async () => {
      ;(
        (
          await databases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
            Query.equal('poll_id', pollIdToShowResults!),
          ])
        ).documents as VoteDocument[]
      ).forEach((vote) => {
        votesMap.set(vote.vote, (votesMap.get(vote.vote) || 0) + 1)
      })
      setVotes(votesMap)
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
        {Array.from(votes, ([voteOption, count]) => {
          return (
            <li
              key={voteOption}
              className={Math.max(...Array.from(votes.values())) === count ? 'underline' : ''}
            >
              {voteOption} — {count} гол.
            </li>
          )
        })}
      </div>
    </Modal>
  )
}
