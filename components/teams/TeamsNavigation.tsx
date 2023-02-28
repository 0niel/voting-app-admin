import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Models, Teams } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'

interface TeamNavigationProps {
  className?: string
  eventID?: string
}
export default function TeamsNavigation(props: TeamNavigationProps) {
  const router = useRouter()
  const { client } = useAppwrite()
  const teams = new Teams(client)

  return (
    <div className={`${props.className} tabs justify-center`}>
      <Link
        href={props.eventID ? `/admin/events/${props.eventID}/access-moderators` : ''}
        className={`tab-bordered tab ${
          router.pathname.includes('access-moderators') && 'tab-active'
        }`}
      >
        Модераторы доступа
      </Link>
      <Link
        href={props.eventID ? `/admin/events/${props.eventID}/voting-moderators` : ''}
        className={`tab-bordered tab ${
          router.pathname.includes('voting-moderators') && 'tab-active'
        }`}
      >
        Модераторы голосования
      </Link>
      <Link
        href={props.eventID ? `/admin/events/${props.eventID}/participants` : ''}
        className={`tab-bordered tab ${router.pathname.includes('participants') && 'tab-active'}`}
      >
        Участники
      </Link>
    </div>
  )
}
