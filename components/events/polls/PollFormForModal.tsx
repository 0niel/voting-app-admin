import 'react-datepicker/dist/react-datepicker.css'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import { pluralForm } from '@/lib/pluralForm'

interface PollFormForModalProps {
  question: string
  setQuestion: Function
  duration: number // seconds
  setDuration: Function
  pollOptions: string[]
  setPollOptions: Function
  showOnlyVotersCount: boolean
  setShowOnlyVotersCount: Function
}
export default function PollFormForModal(props: PollFormForModalProps) {
  return (
    <>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Вопрос</label>
        <input
          className=' block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
          placeholder='Захватывать ли РАНХиГС дронами?'
          value={props.question}
          required
          onChange={(event) => props.setQuestion(event.target.value)}
        />
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>
          Длительность голосования (в секундах)
        </label>
        <input
          type='text'
          min={0}
          className=' block h-auto w-full cursor-pointer rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
          value={props.duration}
          required
          onChange={(event) =>
            props.setDuration(event.target.value === '' ? 0 : parseInt(event.target.value))
          }
        />
        <label className='mb-2 block text-sm font-medium text-neutral'>
          {Math.floor(props.duration / 60)}{' '}
          {pluralForm(Math.floor(props.duration / 60), ['минута', 'минуты', 'минут'])}{' '}
          {Math.floor(props.duration % 60)}{' '}
          {pluralForm(Math.floor(props.duration % 60), ['секунда', 'секунды', 'секунд'])}
        </label>
      </div>
      <div className='p-2'>
        <div>
          <label className='label cursor-pointer'>
            <span className='label-text'>
              Отображать ТОЛЬКО количество проголосовавших/непроголосовавших людей
            </span>
            <input
              type='checkbox'
              checked={props.showOnlyVotersCount}
              onChange={(event) => props.setShowOnlyVotersCount(event.target.checked)}
              className='checkbox-primary checkbox'
            />
          </label>
        </div>
      </div>
      <div className='p-2'>
        <label className='mb-2 block text-sm font-medium text-neutral'>Варианты выбора</label>
        <div className='h-56 overflow-y-scroll pr-3'>
          {props.pollOptions.map((pollOption, index) => {
            return (
              <div key={index} className='flex pb-2'>
                <input
                  className={`block h-auto w-full cursor-pointer rounded-lg border bg-gray-50 ${
                    pollOption.length !== 0 ? 'border-base-200' : 'border-warning'
                  } p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary`}
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
        </div>
        <label className='mb-2 block text-sm font-medium text-neutral'>
          Уникальных значений:{' '}
          <span className='font-semibold'>
            {new Set(props.pollOptions.filter((value) => value !== '')).size}
          </span>
        </label>
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
