import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Permission, Query, Role, Teams, Users } from 'node-appwrite'

import {
  appwriteAccessLogsCollection,
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListMembershipsLimit,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { mapAppwriteErroToMessage } from '@/lib/errorMessages'
import { EventDocument } from '@/lib/models/EventDocument'

export default async function updateParticipant(req: NextApiRequest, res: NextApiResponse) {
  const { eventID, jwt, receivedId } = await req.body

  if (!eventID || !jwt || !receivedId) {
    res.status(400).json({ message: 'Неверный запрос' })
    return
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.status(405).json({ message: 'Метод не поддерживается' })
    return
  }

  const accessType = req.method === 'POST' ? 'выдан' : 'отозван'

  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const account = await new Account(client).get()
    const database = new Databases(client)
    const teams = new Teams(client)

    let isSuperUser = true
    let isAccessModerator = true
    let isCreator = true

    try {
      await teams.get(appwriteSuperUsersTeam)
    } catch (error) {
      isSuperUser = false
    }

    const event: EventDocument = await database.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      eventID,
    )

    if (!isSuperUser) {
      try {
        await teams.get(event.access_moderators_team_id)
      } catch (error) {
        isAccessModerator = false
      }
    }

    isCreator = event.creator_id === account.$id

    if (isSuperUser || isCreator || isAccessModerator) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const serverTeams = new Teams(server)
      const serverDatabase = new Databases(server)
      const serverUsers = new Users(server)

      const user = await serverUsers.get(receivedId)

      if (req.method === 'POST') {
        await serverTeams.createMembership(
          event.participants_team_id,
          user.email,
          [],
          process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME!,
        )
      } else {
        try {
          const memberships = await serverTeams.listMemberships(event.participants_team_id, [
            Query.limit(appwriteListMembershipsLimit),
          ])
          const membership = memberships.memberships.find((m) => m.userId === receivedId)
          if (!membership) {
            res.status(404).json({ message: 'Участник не найден' })
            return
          }

          await serverTeams.deleteMembership(event.participants_team_id, membership.$id)
        } catch (error) {
          res.status(500).json({ message: mapAppwriteErroToMessage((error as Error).message) })
          return
        }
      }

      const accessLog = {
        event_id: eventID,
        given_by_id: account.$id,
        access_type: accessType,
        received_id: receivedId,
      }

      await serverDatabase.createDocument(
        appwriteVotingDatabase,
        appwriteAccessLogsCollection,
        ID.unique(),
        accessLog,
        [Permission.read(Role.team(event.access_moderators_team_id))],
      )

      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'Недостаточно прав' })
    }
  } catch (error) {
    res.status(500).json({ message: mapAppwriteErroToMessage((error as Error).message) })
  }
}
