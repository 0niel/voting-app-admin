import React, { useEffect, useState } from 'react'

import { pluralForm } from '@/lib/pluralForm'

const CountDown = ({
  pollId,
  timeLeft,
  setTimeEnd,
}: {
  pollId: string
  timeLeft: number
  setTimeEnd: (time: number, pollId: string) => void
}) => {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0)

  useEffect(() => {
    setCurrentTimeLeft(timeLeft)
  }, [timeLeft])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTimeLeft > 0) {
        setDays(Math.floor(timeLeft / (60 * 60 * 24)))
        setHours(Math.floor((timeLeft / (60 * 60)) % 24))
        setMinutes(Math.floor((timeLeft / 60) % 60))
        setSeconds(Math.floor(timeLeft % 60))
      }
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimeLeft])

  const handleAddTime = (secondsToAdd: number) => {
    updateTimeLeft(currentTimeLeft + secondsToAdd)
  }

  const handleStop = () => {
    updateTimeLeft(0)
  }

  const updateTimeLeft = (newTimeLeft: number) => {
    setCurrentTimeLeft(newTimeLeft)
    if (newTimeLeft > 0 || newTimeLeft === 0) {
      setTimeEnd(Date.now() + newTimeLeft * 1000, pollId)
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
      <div className='flex items-center'>
        <ul className='flex'>
          <li>
            <button className='btn-ghost btn' onClick={() => handleAddTime(30)}>
              +30 сек
            </button>
          </li>
          <li>
            <button className='btn-ghost btn' onClick={() => handleAddTime(60)}>
              +1 мин
            </button>
          </li>
          <li>
            <button className='btn-ghost btn' onClick={() => handleAddTime(300)}>
              +5 мин
            </button>
          </li>
          <li>
            <button className='btn-ghost btn' onClick={() => handleStop()}>
              Стоп
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CountDown
