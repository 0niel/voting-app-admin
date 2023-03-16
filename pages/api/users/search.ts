import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, Query, Teams, Users } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'

// Поиск пользователей по email или name (только для модераторов доступа и суперпользователей)
export default async function searchUser(req: NextApiRequest, res: NextApiResponse) {
  let substring: string
  let eventID: string
  let jwt: string

  if (req.method === 'POST') {
    substring = req.body.substring
    eventID = req.body.eventID
    jwt = req.body.jwt
  } else {
    substring = req.query.substring as string
    eventID = req.query.eventID as string
    jwt = req.query.jwt as string
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
    if (!isSuperUser && eventID) {
      const event: EventDocument = await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID,
      )
      try {
        await teams.get(event.access_moderators_team_id)
      } catch (error) {
        isAccessModerator = false
      }
    }

    if (isSuperUser || isAccessModerator) {
      if (!substring || substring.length === 0) {
        return res.status(400).json({ message: 'Не указана строка поиска.' })
      }
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const users = new Users(server)

      const usersList = await users.list([Query.limit(5)], substring)

      const usersRes: {
        id: string
        name: string
        email: string
        prefs: {
          [key: string]: string
        }
      }[] = []

      usersList.users.map(async (user) => {
        const name = user.name
        const email = user.email
        const id = user.$id

        if (usersRes.some((user) => user.email === email)) {
          return
        }

        usersRes.push({
          id,
          name,
          email,
          prefs: user.prefs,
        })
      })

      res.status(200).json({ users: usersRes })
    } else {
      res.status(403).json({ message: 'У Вас нет доступа к этому действию.' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: (error as Error).message })
  }
}
