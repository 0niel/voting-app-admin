import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Databases, ID, Models, Permission, Role, Teams } from 'appwrite'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import CreateEventModal from '@/components/events/CreateEventModal'
import DeleteEventModal from '@/components/events/DeleteEventModal'
import UpdateEventModal from '@/components/events/UpdateEventModal'
import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import Table, { Cell, Column } from '@/components/Table'
import {
  appwriteEventsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import useUser from '@/lib/useUser'

const Events = () => {
  const { client } = useAppwrite()
  const { setEventIdToUpdate, setEventIdToDelete } = useEvent()
  const [events, setEvents] = useState<Models.Document[]>([])
  const databases = new Databases(client)
  const teams = new Teams(client)
  const [userTeamIDs, setUserTeamIDs] = useState<string[]>()
  const { setCreateEvent } = useEvent()

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateEventList() {
    try {
      setEvents(
        (
          await databases.listDocuments(appwriteVotingDatabase, appwriteEventsCollection)
        ).documents.reverse(),
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

  const columns: Column[] = [
    { title: 'id' },
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
            value: '-',
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
            value: '-',
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
            value: '-',
          },
      { value: event.votings ? event.votings.length : 0 },

      {
        value: (
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
