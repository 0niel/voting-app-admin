import { Databases, ID, Permission, Role, Teams } from 'appwrite'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

import Modal from '@/components/Modal'
import {
  appwriteEventsCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import { useEvent } from '@/context/EventContext'
import useUser from '@/lib/useUser'

export default function CreateEventModal() {
  const { createEvent, setCreateEvent } = useEvent()
  const [newEventName, setNewEventName] = useState('')
  const { client } = useAppwrite()
  const { user } = useUser()
  const teams = new Teams(client)
  const databases = new Databases(client)

  async function addEventToDatabase() {
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
        setCreateEvent(false)
      } else {
        toast.error('Введите название события.')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen={createEvent}
      setOpen={setCreateEvent}
      onAccept={addEventToDatabase}
      acceptButtonName='Создать'
      onCancel={() => setCreateEvent(false)}
      title='Создать событие'
    >
      <div className='form-control w-full max-w-xs pt-5'>
        <label className='label'>
          <span className='label-text'>Название</span>
        </label>
        <input
          type='text'
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
        />
      </div>
    </Modal>
  )
}
