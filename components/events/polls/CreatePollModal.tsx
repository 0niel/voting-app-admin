import 'react-datepicker/dist/react-datepicker.css'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Databases, ID, Permission, Role } from 'appwrite'
import ru from 'date-fns/locale/ru'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import {
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import { EventDocument } from '@/lib/models/EventDocument'
import useUser from '@/lib/useUser'

export default function CreatePollModal() {
  const initialQuestion = ''
  const initialStartDate = new Date()
  const initialFinishDate = new Date()
  const initialPollOptions = ['да', 'нет']

  const router = useRouter()
  const { client } = useAppwrite()
  const { user } = useUser()
  const { eventID } = router.query
  const databases = new Databases(client)
  const { createPoll, setCreatePoll } = usePoll()
  const [question, setQuestion] = useState(initialQuestion)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [finishDate, setFinishDate] = useState(initialFinishDate)
  const [pollOptions, setPollOptions] = useState<string[]>(initialPollOptions)
  const [event, setEvent] = useState<EventDocument>()

  useEffect(() => {
    setQuestion(initialQuestion)
    setStartDate(initialStartDate)
    setFinishDate(initialFinishDate)
    setPollOptions(initialPollOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPoll])

  useEffect(() => {
    const fetchEvent = async () => {
      const _event = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID as string,
      )
      setEvent(_event as EventDocument)
    }
    if (router.isReady) {
      registerLocale('ru', ru)
      fetchEvent().catch((error) => toast.error(error.message))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  async function createEvent() {
    if (question.length === 0) {
      toast.error('Не указан вопрос голосования.')
      return
    }
    if (startDate > finishDate) {
      toast.error('Дата начала голосования позже его окончания.')
      return
    }
    if (pollOptions.length < 2) {
      toast.error('Укажите хотя бы два варианта голосования.')
      return
    }
    if (pollOptions.some((option) => option.length == 0)) {
      toast.error('Не оставляйте поля вариантов голосования пустыми.')
      return
    }
    await databases.createDocument(
      appwriteVotingDatabase,
      appwritePollsCollection,
      ID.unique(),
      {
        question: question,
        creator_id: user?.userData?.$id,
        start_at: startDate.toISOString(),
        end_at: finishDate.toISOString(),
        event_id: eventID,
        poll_options: pollOptions,
      },
      [
        Permission.read(Role.team(event?.participants_team_id!)),
        Permission.read(Role.team(event?.voting_moderators_team_id!)),
        Permission.read(Role.team(appwriteSuperUsersTeam)),
        Permission.update(Role.team(event?.voting_moderators_team_id!)),
        Permission.update(Role.team(appwriteSuperUsersTeam)),
        Permission.delete(Role.team(event?.voting_moderators_team_id!)),
        Permission.delete(Role.team(appwriteSuperUsersTeam)),
      ],
    )
    setCreatePoll(false)
  }

  return (
    <Modal
      isOpen={createPoll!}
      onAccept={createEvent}
      acceptButtonName='Создать голосование'
      onCancel={() => setCreatePoll(false)}
      title='Голосования'
    >
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Вопрос</label>
        <input
          className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
          placeholder='Захватывать ли РАНХиГС дронами?'
          value={question}
          required
          onChange={(event) => setQuestion(event.target.value)}
        />
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Начало голосования</label>
        <ReactDatePicker
          selected={startDate}
          onChange={(date) => date && setStartDate(date)}
          locale='ru'
          showTimeSelect
          timeFormat='p'
          timeIntervals={5}
          dateFormat='Pp'
          shouldCloseOnSelect
        />
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>
          Завершение голосования
        </label>
        <ReactDatePicker
          selected={finishDate}
          onChange={(date) => date && setFinishDate(date)}
          locale='ru'
          showTimeSelect
          timeFormat='p'
          timeIntervals={5}
          dateFormat='Pp'
          shouldCloseOnSelect
        />
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Варианты выбора</label>
        {pollOptions.map((pollOption, index) => {
          return (
            <div key={index} className='flex pb-2'>
              <input
                className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
                value={pollOption}
                onChange={(event) => {
                  const options = pollOptions.slice()
                  options[index] = event.target.value
                  setPollOptions(options)
                }}
              />
              <button
                onClick={() =>
                  setPollOptions([...pollOptions.slice(0, index), ...pollOptions.slice(index + 1)])
                }
              >
                <XMarkIcon className='ml-3 h-6 w-6' />
              </button>
            </div>
          )
        })}
        <button
          className='btn-neutral btn-outline btn'
          onClick={() => setPollOptions([...pollOptions, ''])}
        >
          <PlusIcon className='h-5 w-5' />
          Добавить вариант выбора
        </button>
      </div>
    </Modal>
  )
}
