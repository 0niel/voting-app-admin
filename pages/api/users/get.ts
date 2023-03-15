import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, Teams, Users } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'

export default async function getUserById(req: NextApiRequest, res: NextApiResponse) {
  const { userId, eventId, jwt } = await req.body

  if (!userId || !eventId || !jwt) {
    return res.status(400).json({ message: 'Не указаны все необходимые параметры.' })
  }

  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setJWT(jwt)

  const databases = new Databases(client)
  const teams = new Teams(client)

  try {
    let isAccessModerator = true
    let isSuperUser = true

    try {
      await teams.get(appwriteSuperUsersTeam)
    } catch (error) {
      isSuperUser = false
    }
    if (!isSuperUser && eventId) {
      const event: EventDocument = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventId,
      )
      try {
        await teams.get(event.access_moderators_team_id)
      } catch (error) {
        isAccessModerator = false
      }
    }

    if (isSuperUser || isAccessModerator) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const users = new Users(server)

      try {
        const userRes = await users.get(userId)

        const user = {
          name: userRes.name,
          email: userRes.email,
          prefs: userRes.prefs,
        }

        res.status(200).json({ user: user })
      } catch (error) {
        res.status(404).json({ message: 'Пользователь не найден.' })
      }
    } else {
      res.status(403).json({ message: 'У Вас нет доступа к этому действию.' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: (error as Error).message })
  }
}
