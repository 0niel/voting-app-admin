import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Teams } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'

interface TeamNavigationProps {
  className?: string
  eventID?: string
}
export default function TeamsNavigation(props: TeamNavigationProps) {
  const router = useRouter()

  return (
    <div className={`${props.className} tabs justify-center`}>
      <Link
        href={props.eventID ? `/admin/events/${props.eventID}/access-moderators` : ''}
        className={`tab tab-bordered ${
          router.pathname.includes('access-moderators') && 'tab-active'
        }`}
      >
        Модераторы доступа
      </Link>
      <Link
        href={props.eventID ? `/admin/events/${props.eventID}/voting-moderators` : ''}
        className={`tab tab-bordered ${
          router.pathname.includes('voting-moderators') && 'tab-active'
        }`}
      >
        Модераторы голосования
      </Link>
      <Link
        href={props.eventID ? `/admin/events/${props.eventID}/participants` : ''}
        className={`tab tab-bordered ${router.pathname.includes('participants') && 'tab-active'}`}
      >
        Участники
      </Link>
    </div>
  )
}
