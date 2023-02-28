import type { NextApiRequest, NextApiResponse } from 'next'
import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/lib/session'
import { Client, Teams } from 'node-appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'

export default withIronSessionApiRoute(createMembership, sessionOptions)

async function createMembership(req: NextApiRequest, res: NextApiResponse) {
  const { teamID, email, roles, url, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)
    const memberships = await new Teams(client)
      .listMemberships(teamID)
      .then((membershipList) => membershipList.memberships)
    const account = await new Account(client).get()
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
        .setKey(process.env.API_TEAMS_ACCESS_TOKEN!)
      await new Teams(server).createMembership(teamID, email, roles || [], url)
      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'Client is not owner of the team.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
