import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Databases, Teams } from 'appwrite'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CreateEventModal from '@/components/events/CreateEventModal'
import DeleteEventModal from '@/components/events/DeleteEventModal'
import UpdateEventModal from '@/components/events/UpdateEventModal'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell, Column } from '@/components/Table'
import {
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import { mapAppwriteErroToMessage } from '@/lib/errorMessages'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import useUser from '@/lib/useUser'

const Events = () => {
  const { client } = useAppwrite()
  const { setEventIdToUpdate, setEventIdToDelete } = useEvent()
  const [events, setEvents] = useState<EventDocument[]>([])
  const [polls, setPolls] = useState<PollDocument[]>([])
  const databases = new Databases(client)
  const teams = new Teams(client)
  const [userTeamIDs, setUserTeamIDs] = useState<string[]>()
  const { setCreateEvent } = useEvent()
  const [hasPermissionToCreteEvent, setHasPermissionToCreteEvent] = useState(false)

  useEffect(() => {
    const subscribe = async function () {
      await updateEventList()
      client.subscribe('documents', (response) => {
        if (
          // @ts-ignore
          response.payload!.$databaseId === appwriteVotingDatabase &&
          // @ts-ignore
          response.payload!.$collectionId === appwriteEventsCollection
        ) {
          updateEventList()
        }
      })
    }
    subscribe().catch((error) => toast.error(error.message))
    async function fetchTeams() {
      const permission = (await new Teams(client!).list()).teams.some(
        (team) => team.$id === appwriteSuperUsersTeam,
      )
      setHasPermissionToCreteEvent(permission)
    }
    fetchTeams().catch((error) => toast.error(error.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateEventList() {
    try {
      setPolls(
        (await databases.listDocuments(appwriteVotingDatabase, appwritePollsCollection))
          .documents as PollDocument[],
      )
      setEvents(
        (
          await databases.listDocuments(appwriteVotingDatabase, appwriteEventsCollection)
        ).documents.reverse() as EventDocument[],
      )
      setUserTeamIDs((await teams.list()).teams.map((team) => team.$id))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const isUserHasTeamAccess = (teamID: string) => {
    if (userTeamIDs) {
      return userTeamIDs.includes(teamID) || userTeamIDs.includes(appwriteSuperUsersTeam)
    }

    return false
  }

  const isUserEventOwner = (
    accessModeratorsTeamID: string,
    votingModeratorsTeamID: string,
    participantsTeamID: string,
  ) => {
    if (userTeamIDs) {
      return (
        (userTeamIDs.includes(accessModeratorsTeamID) &&
          userTeamIDs.includes(votingModeratorsTeamID) &&
          userTeamIDs.includes(participantsTeamID)) ||
        userTeamIDs.includes(appwriteSuperUsersTeam)
      )
    }
    return false
  }

  const columns: Column[] = [
    { title: 'id' },
    { title: 'Состояние' },
    { title: 'Название' },
    { title: 'Модер. доступа' },
    { title: 'Модер. голос.' },
    { title: 'Участники' },
    { title: 'Голосования' },
    { title: '' },
  ]

  const clickableClassName =
    'text-blue-500 hover:text-blue-700 cursor-pointer underline after:content-["_↗"]'
  const rows: Cell[][] = events.map((event) => {
    return [
      { value: event.$id },
      {
        value: event.is_active ? 'Активно' : 'Неактивно',
        onClick: () => {
          try {
            if (
              isUserEventOwner(
                event.access_moderators_team_id,
                event.voting_moderators_team_id,
                event.participants_team_id,
              )
            ) {
              databases.updateDocument(
                appwriteVotingDatabase,
                appwriteEventsCollection,
                event.$id,
                {
                  is_active: !event.is_active,
                },
              )
            } else {
              toast.error('Недостаточно прав на изменение состояния события')
            }
          } catch (error: any) {
            toast.error(mapAppwriteErroToMessage(error.message))
          }
        },
        className: event.is_active
          ? 'hover:text-green-700 cursor-pointer text-green-500 bg-green-100 before:content-["✅"] uppercase'
          : 'hover:text-red-700 cursor-pointer text-red-500 bg-red-100 before:content-["❌"] uppercase',
      },

      { value: event.$id },
      { value: event.name },
      isUserHasTeamAccess(event.access_moderators_team_id)
        ? {
            value: event.access_moderators_team_id,
            onClick: () => {
              window.open(`/admin/events/${event.$id}/access-moderators`)
            },
            className: clickableClassName,
          }
        : {
            value: 'Нет прав',
          },
      isUserHasTeamAccess(event.voting_moderators_team_id)
        ? {
            value: event.voting_moderators_team_id,
            onClick: () => {
              window.open(`/admin/events/${event.$id}/voting-moderators`)
            },
            className: clickableClassName,
          }
        : {
            value: 'Нет прав',
          },
      isUserHasTeamAccess(event.access_moderators_team_id)
        ? {
            value: event.participants_team_id,
            onClick: () => {
              window.open(`/admin/events/${event.$id}/participants`)
            },
            className: clickableClassName,
          }
        : {
            value: 'Нет прав',
          },
      isUserHasTeamAccess(event.voting_moderators_team_id)
        ? {
            value: polls.filter((poll) => poll.event_id === event.$id).length.toString(),
            onClick: () => {
              window.open(`/admin/events/${event.$id}/polls`)
            },
            className: clickableClassName,
          }
        : {
            value: 'Нет прав',
          },
      {
        value: isUserEventOwner(
          event.access_moderators_team_id,
          event.voting_moderators_team_id,
          event.participants_team_id,
        ) ? (
          <div className='flex space-x-2'>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setEventIdToUpdate(event.$id)}
            >
              <PencilIcon className='h-6 w-6' />
            </button>
            <button
              className='btn-outline btn-secondary btn'
              onClick={() => setEventIdToDelete(event.$id)}
            >
              <TrashIcon className='h-6 w-6' />
            </button>
          </div>
        ) : (
          ''
        ),
      },
    ]
  })

  return (
    <>
      <div className='mt-4 flex flex-col space-y-4'>
        <Table
          columns={columns}
          rows={rows}
          title='Список мероприятий'
          description='Список всех мероприятий, созданных в системе. Меропрития - это события, в рамках которых проводятся голосования'
          action='Создать мероприятие'
          onActionClick={() => setCreateEvent(true)}
          isDisabledAction={!hasPermissionToCreteEvent}
        />

        <div className='rounded-md bg-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8'>
          <h2 className='text-2xl font-semibold'>Кто такие модераторы доступа и голосований?</h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <p>
              <span className='font-semibold'>Модераторы доступа</span> могут управлять доступом
              участников к голосованиям. Они добавляют и удаляют участников из группы{' '}
              <span className='font-semibold'>Участники</span>.
            </p>
            <p>
              <span className='font-semibold'>Модераторы голосования</span> могут управлять
              голосованиями. Они могут создавать, редактировать и удалять голосования, изменять
              время начала и окончания голосования.
            </p>
          </div>
        </div>
      </div>
      <CreateEventModal />
      <UpdateEventModal />
      <DeleteEventModal />
    </>
  )
}

Events.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Events
