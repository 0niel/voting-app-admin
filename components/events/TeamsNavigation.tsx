import { Query, Teams } from 'appwrite'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { appwriteListTeamsLimit } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { EventDocument } from '@/lib/models/EventDocument'

interface TeamNavigationProps {
  className?: string
  event: EventDocument
}

export default function TeamsNavigation(props: TeamNavigationProps) {
  const router = useRouter()
  const { client } = useAppwrite()
  const teams = new Teams(client)

  const [hasAccessToAccessModeratorsTeam, setHasAccessToAccessModeratorsTeam] = useState(false)
  const [hasAccessToVotingModeratorsTeam, setHasAccessToVotingModeratorsTeam] = useState(false)
  const [hasAccessToParticipantsTeam, setHasAccessToParticipantsTeam] = useState(false)
  const [hasAccessToPolls, setHasAccessToPolls] = useState(false)

  useEffect(() => {
    const fetchTeam = async function (teamID: string) {
      return (await teams.list([Query.equal('$id', teamID), Query.limit(appwriteListTeamsLimit)]))
        .total
    }
    fetchTeam(props.event.access_moderators_team_id)
      .then((count) => {
        setHasAccessToAccessModeratorsTeam(count == 1)
        setHasAccessToParticipantsTeam(count == 1)
      })
      .catch((error: any) => toast.error(error.message))
    fetchTeam(props.event.voting_moderators_team_id)
      .then((count) => {
        setHasAccessToVotingModeratorsTeam(count == 1)
        setHasAccessToPolls(count == 1)
      })
      .catch((error: any) => toast.error(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`${props.className} tabs justify-center`}>
      {hasAccessToAccessModeratorsTeam && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/access-moderators` : ''}
          className={`tab-bordered tab ${
            router.pathname.includes('access-moderators') && 'tab-active'
          }`}
        >
          Модераторы доступа
        </Link>
      )}
      {hasAccessToVotingModeratorsTeam && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/voting-moderators` : ''}
          className={`tab-bordered tab ${
            router.pathname.includes('voting-moderators') && 'tab-active'
          }`}
        >
          Модераторы голосования
        </Link>
      )}
      {hasAccessToParticipantsTeam && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/participants` : ''}
          className={`tab-bordered tab ${router.pathname.includes('participants') && 'tab-active'}`}
        >
          Участники
        </Link>
      )}
      {hasAccessToPolls && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/polls` : ''}
          className={`tab-bordered tab ${router.pathname.includes('polls') && 'tab-active'}`}
        >
          Голосования
        </Link>
      )}
    </div>
  )
}
