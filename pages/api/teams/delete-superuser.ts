import { NextApiRequest, NextApiResponse } from 'next'
import { Client, Query, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteListMembershipsLimit,
  appwriteProjectId,
  appwriteSuperUsersTeam,
} from '@/constants/constants'

export default async function deleteSuperuser(req: NextApiRequest, res: NextApiResponse) {
  const { userID, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    // Получаем список членов команды.
    const isSuperuser = await new Teams(client)
      .list([Query.equal('$id', appwriteSuperUsersTeam)])
      .then((teamList) => teamList.total == 1)

    if (isSuperuser) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const serverTeams = new Teams(server)
      const teams = (await serverTeams.list()).teams
      const userMembershipIDs = (
        await Promise.all(
          teams.map(
            async (team) =>
              await serverTeams.listMemberships(team.$id, [
                Query.equal('userId', userID),
                Query.limit(appwriteListMembershipsLimit),
              ]),
          ),
        )
      ).map((membershipList) => membershipList.memberships.pop()?.$id)
      userMembershipIDs.map(async (membershipID, index) => {
        membershipID && (await serverTeams.deleteMembership(teams[index].$id, membershipID))
      })

      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'You cannot invite new superusers.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
