import { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Permission, Query, Role, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteInitialPollsCollection,
  appwriteListInitialPollsLimit,
  appwriteListMembershipsLimit,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { mapAppwriteErrorToMessage } from '@/lib/errorMessages'
import { InitialPollDocument } from '@/lib/models/InitialPollDocument'
import { PollDocument } from '@/lib/models/PollDocument'

export default async function create(req: NextApiRequest, res: NextApiResponse) {
  const { eventName, startAtDateTime, addInitialPolls, jwt } = req.body

  if (eventName === undefined) {
    res.status(500).json({ message: 'Укажите название мероприятия.' })
    return
  }
  if (startAtDateTime === undefined) {
    res.status(500).json({ message: 'Укажите дату и время начала мероприятия.' })
    return
  }
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
      const superuserMemberships = (
        await serverTeams.listMemberships(appwriteSuperUsersTeam, [
          Query.limit(appwriteListMembershipsLimit),
        ])
      ).memberships

      await Promise.all(
        superuserMemberships.map(async (membership) => {
          await Promise.all(
            allNewTeamIDs.map(async (teamID) => {
              await serverTeams.createMembership(
                teamID,
                membership.userEmail,
                ['owner', ...membership.roles],
                process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME!,
              )
            }),
          )
        }),
      )

      const createdEvent = await serverDatabases.createDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        ID.unique(),
        {
          name: eventName,
          creator_id: accountID,
          access_moderators_team_id: accessModeratorsTeamID,
          voting_moderators_team_id: votingModeratorsTeamID,
          participants_team_id: participantsTeamID,
          is_active: false,
          start_at: startAtDateTime,
        },
        [
          Permission.read(Role.team(accessModeratorsTeamID)),
          Permission.read(Role.team(votingModeratorsTeamID)),
          Permission.read(Role.team(participantsTeamID)),
        ],
      )

      if (addInitialPolls) {
        const initialPolls = (
          await serverDatabases.listDocuments(
            appwriteVotingDatabase,
            appwriteInitialPollsCollection,
            [Query.limit(appwriteListInitialPollsLimit)],
          )
        ).documents as InitialPollDocument[]
        for (const poll of initialPolls) {
          await serverDatabases.createDocument(
            appwriteVotingDatabase,
            appwritePollsCollection,
            ID.unique(),
            {
              question: poll.question,
              creator_id: accountID,
              start_at: undefined,
              end_at: undefined,
              duration: poll.duration,
              event_id: createdEvent.$id,
              poll_options: poll.poll_options,
              is_finished: false,
              show_only_voters_count: true,
            } as PollDocument,
            [
              Permission.read(Role.team(participantsTeamID)),
              Permission.read(Role.team(votingModeratorsTeamID)),
              Permission.update(Role.team(votingModeratorsTeamID)),
            ],
          )
        }
      }

      res.status(200).json({ message: 'ok' })
    } else {
      res
        .status(403)
        .json({ message: 'Вы не являетесь суперпользователем, чтобы создать мероприятие.' })
    }
  } catch (error) {
    res.status(500).json({ message: mapAppwriteErrorToMessage((error as Error).message) })
  }
}
