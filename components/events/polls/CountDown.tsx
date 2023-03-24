import React, { useEffect, useState } from 'react'

import { pluralForm } from '@/lib/pluralForm'

interface CountDownInterface {
  pollId: string
  timeLeft: number
  isStarted: boolean
  isFinished: boolean
  setTimeStart: (time: number, pollId: string) => void
  setTimeEnd: (time: number, pollId: string) => void
  finishPoll: (pollId: string) => void
}

export default function CountDown(props: CountDownInterface) {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0)

  useEffect(() => {
    setCurrentTimeLeft(props.timeLeft)
  }, [props.timeLeft])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTimeLeft > 0) {
        setDays(Math.floor(props.timeLeft / (60 * 60 * 24)))
        setHours(Math.floor((props.timeLeft / (60 * 60)) % 24))
        setMinutes(Math.floor((props.timeLeft / 60) % 60))
        setSeconds(Math.floor(props.timeLeft % 60))
      }
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeLeft])

  const handleAddTime = (secondsToAdd: number) => {
    updateTimeLeft((currentTimeLeft > 0 ? currentTimeLeft : 0) + secondsToAdd)
  }

  const handleStop = () => {
    updateTimeLeft(0)
  }

  const updateTimeLeft = (newTimeLeft: number) => {
    setCurrentTimeLeft(newTimeLeft)
    if (newTimeLeft > 0 || newTimeLeft === 0) {
      props.setTimeEnd(Date.now() + newTimeLeft * 1000, props.pollId)
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <div className='flex items-center'>
        {days > 0 && (
          <>
            {days} {pluralForm(days, ['день', 'дня', 'дней'])}{' '}
          </>
        )}
        {hours > 0 && (
          <>
            {hours} {pluralForm(hours, ['час', 'часа', 'часов'])}{' '}
          </>
        )}
        {minutes > 0 && (
          <>
            {minutes} {pluralForm(minutes, ['минута', 'минуты', 'минут'])}{' '}
          </>
        )}
        {seconds > 0 && (
          <>
            {seconds} {pluralForm(seconds, ['секунда', 'секунды', 'секунд'])}{' '}
          </>
        )}
      </div>
      <div className='flex-col items-center'>
        <ul className='flex'>
          <li>
            <button
              className='btn-ghost btn'
              disabled={!props.isStarted || props.isFinished}
              onClick={() => handleAddTime(5)}
            >
              +5 сек
            </button>
          </li>
          <li>
            <button
              className='btn-ghost btn'
              disabled={!props.isStarted || props.isFinished}
              onClick={() => handleAddTime(10)}
            >
              +10 сек
            </button>
          </li>
          <li>
            <button
              className='btn-ghost btn'
              disabled={!props.isStarted || props.isFinished}
              onClick={() => handleAddTime(30)}
            >
              +30 сек
            </button>
          </li>
          <li>
            <button
              className='btn-ghost btn'
              disabled={!props.isStarted || props.isFinished}
              onClick={() => handleAddTime(60)}
            >
              +1 мин
            </button>
          </li>
        </ul>
        <ul className='flex justify-center'>
          <li>
            <button
              className='btn-ghost btn'
              disabled={props.isStarted || props.isFinished}
              onClick={() => props.setTimeStart(Date.now(), props.pollId)}
            >
              Старт
            </button>
          </li>
          <li>
            <button
              className='btn-ghost btn'
              disabled={!props.isStarted || props.isFinished}
              onClick={handleStop}
            >
              Стоп
            </button>
          </li>
          <li>
            <button
              className='btn-ghost btn'
              disabled={!props.isStarted || props.isFinished}
              onClick={() => props.finishPoll(props.pollId)}
            >
              Подвести итоги
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
