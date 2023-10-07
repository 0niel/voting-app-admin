import { Query } from 'appwrite'
import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteListMembershipsLimit,
  appwriteProjectId,
} from '@/constants/constants'
import { sessionOptions } from '@/lib/session'

export enum TeamAppointment {
  accessModerators,
  votingModerators,
  participants,
}
export default withIronSessionApiRoute(createMembership, sessionOptions)

async function createMembership(req: NextApiRequest, res: NextApiResponse) {
  const { teamAppointment, teamID, email, roles, url, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const account = await new Account(client).get()
    // Получаем список членов команды.
    const memberships = await new Teams(client)
      .listMemberships(teamID, [
        Query.equal('userId', account.$id),
        Query.limit(appwriteListMembershipsLimit),
      ])
      .then((membershipList) => membershipList.memberships)

    if (
      memberships.filter(
        (membership) =>
          membership.userId == account.$id &&
          membership.teamId == teamID &&
          membership.roles.includes('owner'),
      ).length > 0
    ) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      await new Teams(server).createMembership(teamID, email, roles || [], url)
      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'Пользователь не является администратором команды.' })
    }
  } catch (error) {
    let message = (error as Error).message
    if (message === 'User has already been invited or is already a member of this team') {
      switch (teamAppointment) {
        case TeamAppointment.accessModerators.valueOf(): {
          message =
            'Пользователь является суперпользователем или уже состоит в командре модераторов доступа.'
          break
        }
        case TeamAppointment.votingModerators.valueOf(): {
          message =
            'Пользователь является суперпользователем или уже состоит в командре модераторов голосования.'
          break
        }
        case TeamAppointment.participants.valueOf(): {
          message =
            'Пользователь является суперпользователем, модератором доступа или уже состоит в командре участников.'
        }
      }
    }
    res.status(500).json({ message })
  }
}
