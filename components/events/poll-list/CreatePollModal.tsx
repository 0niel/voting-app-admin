import 'react-datepicker/dist/react-datepicker.css'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Databases, ID } from 'appwrite'
import ru from 'date-fns/locale/ru'
import { router } from 'next/client'
import React, { useEffect, useRef, useState } from 'react'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { toast } from 'react-hot-toast'

import Modal from '@/components/modal/Modal'
import { appwritePollsCollection, appwriteVotingDatabase } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { usePoll } from '@/context/PollContext'
import useUser from '@/lib/useUser'

export default function CreatePollModal() {
  const { client } = useAppwrite()
  const { user } = useUser()
  const { eventID } = router.query
  const databases = new Databases(client)
  const { createPoll, setCreatePoll } = usePoll()
  const [question, setQuestion] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [finishDate, setFinishDate] = useState(new Date())
  const [pollOptions, setPollOptions] = useState<string[]>(['нет', 'да'])

  useEffect(() => {
    registerLocale('ru', ru)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPollOptions(['нет', 'да'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPoll])

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
    await databases.createDocument(appwriteVotingDatabase, appwritePollsCollection, ID.unique(), {
      question: question,
      creator_id: user?.userData?.$id,
      start_at: startDate.toISOString(),
      end_at: finishDate.toISOString(),
      event_id: eventID,
      poll_options: pollOptions,
    })
    setCreatePoll(false)
  }

  return (
    <Modal
      isOpen={createPoll!}
      onAccept={createEvent}
      acceptButtonName='Создать'
      onCancel={() => setCreatePoll(false)}
      title='Создать событие'
    >
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Вопрос</label>
        <input
          className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
          placeholder='Определение шагов по захвату РАНХиГСа'
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
