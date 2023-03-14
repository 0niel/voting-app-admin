import 'react-datepicker/dist/react-datepicker.css'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ru } from 'date-fns/locale'
import React from 'react'
import ReactDatePicker from 'react-datepicker'

interface PollFormForModalProps {
  question: string
  setQuestion: Function
  startDate: Date
  setStartDate: Function
  finishDate: Date
  setFinishDate: Function
  pollOptions: string[]
  setPollOptions: Function
}
export default function PollFormForModal(props: PollFormForModalProps) {
  return (
    <>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Вопрос</label>
        <input
          className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
          placeholder='Захватывать ли РАНХиГС дронами?'
          value={props.question}
          required
          onChange={(event) => props.setQuestion(event.target.value)}
        />
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Начало голосования</label>
        <ReactDatePicker
          selected={props.startDate}
          onChange={(date) => date && props.setStartDate(date)}
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
          selected={props.finishDate}
          onChange={(date) => date && props.setFinishDate(date)}
          locale='ru'
          showTimeSelect
          timeFormat='p'
          timeIntervals={1}
          dateFormat='Pp'
          shouldCloseOnSelect
        />
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Варианты выбора</label>
        {props.pollOptions.map((pollOption, index) => {
          return (
            <div key={index} className='flex pb-2'>
              <input
                className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
                value={pollOption}
                onChange={(event) => {
                  const options = props.pollOptions.slice()
                  options[index] = event.target.value
                  props.setPollOptions(options)
                }}
              />
              <button
                onClick={() =>
                  props.setPollOptions([
                    ...props.pollOptions.slice(0, index),
                    ...props.pollOptions.slice(index + 1),
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
          onClick={() => props.setPollOptions([...props.pollOptions, ''])}
        >
          <PlusIcon className='h-5 w-5' />
          Добавить вариант выбора
        </button>
      </div>
    </>
  )
}
