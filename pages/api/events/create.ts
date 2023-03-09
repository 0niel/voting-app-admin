import { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Permission, Query, Role, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'

export default async function create(req: NextApiRequest, res: NextApiResponse) {
  const { eventName, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)
    const account = new Account(client)
    const accountID = await account.get().then((account) => account.$id)

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
      const serverDatabases = new Databases(server)

      const accessModeratorsTeamID = (
        await serverTeams.create(ID.unique(), `Модер. дост. ${eventName}`, ['owner'])
      ).$id
      const votingModeratorsTeamID = (
        await serverTeams.create(ID.unique(), `Модер. голос. ${eventName}`, ['owner'])
      ).$id
      const participantsTeamID = (
        await serverTeams.create(ID.unique(), `Участники ${eventName}`, ['owner'])
      ).$id
      const allNewTeamIDs = [accessModeratorsTeamID, votingModeratorsTeamID, participantsTeamID]
      const superusersTeamEmails = (
        await serverTeams.listMemberships(appwriteSuperUsersTeam)
      ).memberships.map((team) => team.userEmail)

      await Promise.all(
        superusersTeamEmails.map(async (email) => {
          await Promise.all(
            allNewTeamIDs.map(async (teamID) => {
              await serverTeams.createMembership(
                teamID,
                email,
                ['owner'],
                process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME!,
              )
            }),
          )
        }),
      )

      await serverDatabases.createDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        ID.unique(),
        {
          name: eventName,
          creator_id: accountID,
          access_moderators_team_id: accessModeratorsTeamID,
          voting_moderators_team_id: votingModeratorsTeamID,
          participants_team_id: participantsTeamID,
          is_active: true,
        },
        [
          Permission.read(Role.team(accessModeratorsTeamID)),
          Permission.read(Role.team(votingModeratorsTeamID)),
          Permission.read(Role.team(participantsTeamID)),
        ],
      )

      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'Client is not superuser.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
