import { Models, Teams } from 'appwrite'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useAppwrite } from '@/context/AppwriteContext'

interface TeamNavigationProps {
  className?: string
  event?: Models.Document
}
export default function TeamsNavigation(props: TeamNavigationProps) {
  const router = useRouter()
  const { client } = useAppwrite()
  const teams = new Teams(client)
  const [teamIDs, setTeamIDs] = useState<string[]>()

  useEffect(() => {
    const fetchTeams = async function () {
      setTeamIDs((await teams.list()).teams.map((team) => team.$id))
    }
    fetchTeams().catch((error) => toast.error(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`${props.className} tabs justify-center`}>
      {teamIDs?.includes(props.event?.access_moderators_team_id) && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/access-moderators` : ''}
          className={`tab-bordered tab ${
            router.pathname.includes('access-moderators') && 'tab-active'
          }`}
        >
          Модераторы доступа
        </Link>
      )}
      {teamIDs?.includes(props.event?.voting_moderators_team_id) && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/voting-moderators` : ''}
          className={`tab-bordered tab ${
            router.pathname.includes('voting-moderators') && 'tab-active'
          }`}
        >
          Модераторы голосования
        </Link>
      )}
      {teamIDs?.includes(props.event?.participants_team_id) && (
        <Link
          href={props.event?.$id ? `/admin/events/${props.event.$id}/participants` : ''}
          className={`tab-bordered tab ${router.pathname.includes('participants') && 'tab-active'}`}
        >
          Участники
        </Link>
      )}
      {teamIDs?.includes(props.event?.voting_moderators_team_id) && (
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
