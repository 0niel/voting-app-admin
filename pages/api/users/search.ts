import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Query, Teams, Users } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(searchUser, sessionOptions)

// Поиск пользователей по email или name (только для модераторов доступа и суперпользователей)
async function searchUser(req: NextApiRequest, res: NextApiResponse) {
  const { eventID, substring, jwt } = await req.body

  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setJWT(jwt)

  const databases = new Databases(client)
  const teams = new Teams(client)
  const account = await new Account(client).get()

  const userId = account.$id

  try {
    const event: EventDocument = await databases.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      eventID,
    )

    const superuserMembership = await teams.listMemberships(appwriteSuperUsersTeam)

    const isSuperUser = superuserMembership.memberships.some(
      (membership) => membership.userId === userId,
    )
    const accessModeratorsMembership = await teams.listMemberships(event.access_moderators_team_id)
    const isAccessModerator = accessModeratorsMembership.memberships.some(
      (membership) => membership.userId === userId,
    )

    if (isSuperUser || isAccessModerator) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const users = new Users(server)

      const usersList = await users.list([], substring)

      const usersRes: {
        name: string
        email: string
        prefs: {
          [key: string]: string
        }
      }[] = []

      usersList.users.map(async (user) => {
        const name = user.name
        const email = user.email

        if (usersRes.some((user) => user.email === email)) {
          return
        }

        usersRes.push({
          name,
          email,
          prefs: user.prefs,
        })
      })

      res.status(200).json({ users: usersRes })
    } else {
      res.status(403).json({ message: 'У вас нет доступа к этому действию' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: (error as Error).message })
  }
}
