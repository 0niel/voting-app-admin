import { Account } from 'appwrite'
import { useRouter } from 'next/router'

import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import fetchJson from '@/lib/fetchJson'

export default function DeletePollModal() {
  const { pollIdToDelete, setPollIdToDelete } = usePoll()
  const router = useRouter()
  const { eventID } = router.query
  const { client } = useAppwrite()
  const account = new Account(client)

  async function deletePollFromDatabase() {
    const jwt = (await account.createJWT()).jwt
    await fetchJson('/api/polls/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventID,
        pollID: pollIdToDelete,
        jwt,
      }),
    })
    setPollIdToDelete(undefined)
  }

  return (
    <Modal
      isOpen={pollIdToDelete !== undefined}
      onAccept={deletePollFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setPollIdToDelete(undefined)}
      title='Удалить голосование'
    />
  )
}
