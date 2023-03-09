import { Query } from 'appwrite'
import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Teams } from 'node-appwrite'

import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(createMembership, sessionOptions)

async function createMembership(req: NextApiRequest, res: NextApiResponse) {
  const { teamID, email, roles, url, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const account = await new Account(client).get()
    // Получаем список членов команды.
    const memberships = await new Teams(client)
      .listMemberships(teamID, [Query.equal('userId', account.$id)])
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
      res.status(403).json({ message: 'Client is not owner of the team.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
