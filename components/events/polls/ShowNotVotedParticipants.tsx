import { Account } from 'appwrite'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import fetchJson from '@/lib/fetchJson'

function User(props: { userName: string }) {
  return (
    <div className='my-2'>
      <div className='placeholder avatar'>
        <div className='mr-3 w-5 rounded-full bg-accent-focus text-neutral-content'>
          <span>{props.userName[0]}</span>
        </div>
      </div>
      {props.userName}
    </div>
  )
}

function UserPlaceholder() {
  return (
    <div className='my-2 flex'>
      <div className='placeholder avatar'>
        <div className='mr-2 h-5 w-5 rounded-full bg-gray-200' />
      </div>
      <div className='my-0.5 h-5 w-64 rounded-full bg-gray-200' />
    </div>
  )
}

export default function ShowNotVotedParticipants() {
  const router = useRouter()
  const { eventID } = router.query
  const { pollIdToShowNotVotedParticipants, setPollIdToShowNotVotedParticipants } = usePoll()
  const [notVotedParticipants, setNotVotedParticipants] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { client } = useAppwrite()
  const account = new Account(client)

  async function fetchNotVotedParticipants() {
    setLoading(true)
    const jwt = (await account.createJWT()).jwt
    const _notVotedParticipants = await fetchJson<string[]>('/api/polls/not-voted-participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pollID: pollIdToShowNotVotedParticipants,
        eventID,
        jwt,
      }),
    })
    setNotVotedParticipants(_notVotedParticipants)
    setLoading(false)
  }

  useEffect(() => {
    if (pollIdToShowNotVotedParticipants !== undefined) {
      fetchNotVotedParticipants().catch((error: any) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIdToShowNotVotedParticipants])

  return (
    <Modal
      isOpen={pollIdToShowNotVotedParticipants !== undefined}
      onAccept={fetchNotVotedParticipants}
      acceptButtonName='Обновить'
      onCancel={() => setPollIdToShowNotVotedParticipants(undefined)}
      title='Неголосовавшие участники'
      cancelButtonName='Закрыть'
    >
      <div className='flex text-sm text-gray-700'>
        Всего значений:
        {loading ? (
          <div className='mt-1.5 ml-1 h-3.5 w-3.5 items-center justify-between rounded-full bg-gray-200' />
        ) : (
          <span className='ml-1 font-semibold'>{notVotedParticipants?.length}</span>
        )}
      </div>
      <div className='h-56 overflow-y-scroll'>
        {loading &&
          [1, 2, 3, 4, 5].map((_, index) => (
            <React.Fragment key={index}>
              <UserPlaceholder />
              {index !== notVotedParticipants!.length - 1 && (
                <hr className='my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50' />
              )}
            </React.Fragment>
          ))}
        {!loading &&
          notVotedParticipants.map((userName, index) => (
            <React.Fragment key={index}>
              <User userName={userName} />
              {index !== notVotedParticipants!.length - 1 && (
                <hr className='my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50' />
              )}
            </React.Fragment>
          ))}
      </div>
      <div className='text-sm text-gray-700'>Список не обновляется автоматически.</div>
    </Modal>
  )
}
