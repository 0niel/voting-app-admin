import { Models } from 'appwrite'
import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Teams } from 'node-appwrite'

import {
  appwriteAccessLogsCollection,
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { AccessLogDocument } from '@/lib/models/AccessLogDocument'
import { EventDocument } from '@/lib/models/EventDocument'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(updateParticipant, sessionOptions)

async function updateParticipant(req: NextApiRequest, res: NextApiResponse) {
  const { userId, eventId, redirectUrl, jwt } = await req.body

  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setJWT(jwt)

  const account = await new Account(client).get()

  const teams = new Teams(client)
  const memberships = await teams.listMemberships(appwriteSuperUsersTeam)

  async function isMemberOfTeam(teamId: string, userId: string) {
    const memberships = await teams.listMemberships(teamId)
    return memberships.memberships.some((membership) => membership.userId === userId)
  }

  try {
    const isSuperUser = memberships.memberships.some((membership) => membership.userId === userId)

    // Получаем информацию о событии из базы данных
    const database = new Databases(client)
    const event: EventDocument = await database.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      eventId,
    )

    // Проверяем, является ли пользователь создателем события или модератором доступа к нему
    const isCreator = event.creator_id === userId
    const isAccessModerator =
      event.access_moderators_team_id &&
      (await isMemberOfTeam(event.access_moderators_team_id, userId))

    if (isSuperUser || isCreator || isAccessModerator) {
      // Добавляем пользователя в список участников события (participants_team_id)

      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      await new Teams(server).createMembership(
        event.participants_team_id,
        account.email,
        [],
        redirectUrl,
      )

      // Добавляем запись в accessLogs коллекцию
      const accessLog = {
        event_id: eventId,
        given_by_id: userId,
        access_type: 'выдан',
        received_id: account.$id,
      }

      const adminDatabase = new Databases(server)
      await adminDatabase.createDocument(
        appwriteVotingDatabase,
        appwriteAccessLogsCollection,
        ID.unique(),
        accessLog,
      )

      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'Недостаточно прав' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
