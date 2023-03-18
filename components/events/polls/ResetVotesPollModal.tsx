import { Databases, Query } from 'appwrite'

import Modal from '@/components/modal/Modal'
import {
  appwriteListVotesLimit,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'

export default function ResetVotesPollModal() {
  const { pollIdToResetVotes, setPollIdToResetVotes } = usePoll()
  const { client } = useAppwrite()
  const databases = new Databases(client)

  async function deletePollVotesFromDatabase() {
    const response = await databases.listDocuments(
      appwriteVotingDatabase,
      appwriteVotesCollection,
      [Query.limit(appwriteListVotesLimit), Query.equal('poll_id', pollIdToResetVotes!)],
    )
    const votes = response.documents

    for (const vote of votes) {
      if (vote.poll_id == pollIdToResetVotes) {
        console.log('deleting vote: ', vote)
        await databases.deleteDocument(appwriteVotingDatabase, appwriteVotesCollection, vote.$id)
      }
    }

    setPollIdToResetVotes(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToResetVotes !== undefined}
      onAccept={deletePollVotesFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setPollIdToResetVotes(undefined)}
      title='Удалить все голоса'
    />
  )
}
