import { Account } from 'appwrite'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import fetchJson from '@/lib/fetchJson'

export default function ShowNotVotedParticipants() {
  const router = useRouter()
  const { eventID } = router.query
  const { pollIdToShowNotVotedParticipants, setPollIdToShowNotVotedParticipants } = usePoll()
  const [notVotedParticipants, setNotVotedParticipants] = useState<string[]>([])
  const { client } = useAppwrite()
  const account = new Account(client)

  async function fetchNotVotedParticipants() {
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
      <div className='text-sm text-gray-700'>
        Всего значений: <span className='font-semibold'>{notVotedParticipants?.length}</span>
      </div>
      <div className='h-56 overflow-y-scroll'>
        {notVotedParticipants.map((userName, index) => (
          <React.Fragment key={index}>
            <div className='my-2'>
              <div className='placeholder avatar'>
                <div className='w-5 rounded-full bg-accent-focus text-neutral-content'>
                  <span>{userName[0]}</span>
                </div>
              </div>{' '}
              {userName}
            </div>
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
