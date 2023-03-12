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
import { EventDocument } from '@/lib/models/EventDocument'

export default async function updateParticipant(req: NextApiRequest, res: NextApiResponse) {
  const { eventID, redirectUrl, jwt, receivedId } = await req.body

  if (!eventID || !redirectUrl || !jwt || !receivedId) {
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

      await new Teams(server).createMembership(
        event.participants_team_id,
        account.email,
        [],
        redirectUrl,
      )

      const accessLog = {
        event_id: eventID,
        given_by_id: account.$id,
        access_type: accessType,
        received_id: receivedId,
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
