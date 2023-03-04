import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import React, { ReactElement, useEffect, useState } from 'react'
import { Account, Databases, ID, Models, Permission, Role, Teams } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import {
  appwriteEventsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import useUser from '@/lib/useUser'
import { toast } from 'react-hot-toast'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import PanelWindow from '@/components/PanelWindow'
import Link from 'next/link'
import UpdateEventModal from '@/components/events/UpdateEventModal'
import { useEvent } from '@/context/EventContext'
import DeleteEventModal from '@/components/events/DeleteEventModal'
import Table, { TableProps, Column, Cell } from '@/components/Table'

const Events = () => {
  const { client } = useAppwrite()
  const { setEventIdToUpdate, setEventIdToDelete } = useEvent()
  const { user } = useUser()
  const [events, setEvents] = useState<Models.Document[]>([])
  const [newEventName, setNewEventName] = useState('')
  const databases = new Databases(client)
  const teams = new Teams(client)
  const [userTeamIDs, setUserTeamIDs] = useState<string[]>()

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

  async function createEvent() {
    try {
      const eventName = newEventName?.trim()
      if (eventName && eventName.length > 0) {
        const accessModeratorsTeamID = (
          await teams.create(ID.unique(), `Модераторы доступа ${eventName}`, ['owner'])
        ).$id
        const votingModeratorsTeamID = (
          await teams.create(ID.unique(), `Модераторы голосования ${eventName}`, ['owner'])
        ).$id
        const participantsTeamID = (
          await teams.create(ID.unique(), `Участники ${eventName}`, ['owner'])
        ).$id
        await databases.createDocument(
          appwriteVotingDatabase,
          appwriteEventsCollection,
          ID.unique(),
          {
            name: eventName,
            creator_id: user?.userData?.$id,
            access_moderators_team_id: accessModeratorsTeamID,
            voting_moderators_team_id: votingModeratorsTeamID,
            participants_team_id: participantsTeamID,
          },
          [
            Permission.read(Role.team(appwriteSuperUsersTeam)),
            Permission.read(Role.team(accessModeratorsTeamID)),
            Permission.read(Role.team(votingModeratorsTeamID)),
            Permission.read(Role.team(participantsTeamID)),
            Permission.read(Role.team(accessModeratorsTeamID)),
            Permission.update(Role.user(user?.userData?.$id!)),
            Permission.delete(Role.user(user?.userData?.$id!)),
          ],
        )
        setNewEventName('')
      } else {
        toast.error('Введите название события.')
      }
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
          title='Список событий'
          description='Список всех событий'
          action='Создать событие'
          onActionClick={() => createEvent()}
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

      <UpdateEventModal />
      <DeleteEventModal />
    </>
  )
}

Events.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithDrawer>{page}</LayoutWithDrawer>
}

export default Events
