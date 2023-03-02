import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Databases, ID } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { useOnClickOutside } from 'usehooks-ts'
import { usePoll } from '@/context/PollContext'
import { appwritePollsCollection, appwriteVotingDatabase } from '@/constants/constants'
import 'react-datepicker/dist/react-datepicker.css'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import ru from 'date-fns/locale/ru'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import useUser from '@/lib/useUser'
import { router } from 'next/client'
import { toast } from 'react-hot-toast'

export default function CreatePollModal() {
  const dialogPanelRef = useRef(null)
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

  useOnClickOutside(dialogPanelRef, () => {
    setCreatePoll(false)
  })

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
    <Transition appear show={createPoll === true} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel
                ref={dialogPanelRef}
                className='rounded-box w-full max-w-md transform bg-base-100 p-6 text-left align-middle ring-1 ring-secondary transition-all hover:ring-2 hover:ring-secondary-focus'
              >
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  Создать событие
                </Dialog.Title>
                <div className='p-2'>
                  <label className='mb-2 block text-sm font-medium text-neutral'>Вопрос</label>
                  <input
                    className='focus:ring-secondaru block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary'
                    placeholder='Определение шагов по захвату РАНХиГСа'
                    value={question}
                    required
                    onChange={(event) => setQuestion(event.target.value)}
                  />
                </div>
                <div className='p-2'>
                  <label className='mb-2 block text-sm font-medium text-neutral'>
                    Начало голосования
                  </label>
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
                  <label className='mb-2 block text-sm font-medium text-neutral'>
                    Варианты выбора
                  </label>
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
                            setPollOptions([
                              ...pollOptions.slice(0, index),
                              ...pollOptions.slice(index + 1),
                            ])
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
                <div className='mt-6 flex justify-end'>
                  <button
                    type='button'
                    className='btn-primary btn-outline btn'
                    onClick={createEvent}
                  >
                    Создать
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
