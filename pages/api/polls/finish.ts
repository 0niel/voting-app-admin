import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, ID, Query, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListMembershipsLimit,
  appwriteListTeamsLimit,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteVotesCollection,
  appwriteVotingDatabase,
  presidencyRole,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'

export default async function finishPoll(req: NextApiRequest, res: NextApiResponse) {
  const { pollID, eventID, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const databases = new Databases(client)
    const teams = new Teams(client)

    const event = (await databases.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      eventID,
    )) as EventDocument

    const isVotingModerator =
      (
        await teams.list([
          Query.equal('$id', event.voting_moderators_team_id),
          Query.limit(appwriteListTeamsLimit),
        ])
      ).total == 1

    if (isVotingModerator) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)
      const serverDatabases = new Databases(server)
      const serverTeams = new Teams(server)

      await serverDatabases.updateDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollID,
        {
          end_at: new Date().toISOString(),
          is_finished: true,
        },
      )
      const voterIDs = (
        (
          await serverDatabases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
            Query.limit(appwriteListVotesLimit),
          ])
        ).documents as VoteDocument[]
      ).map((vote) => vote.voter_id)
      ;(
        await serverTeams.listMemberships(event?.participants_team_id!, [
          Query.limit(appwriteListMembershipsLimit),
        ])
      ).memberships
        .filter(
          (membership) =>
            !voterIDs.includes(membership.userId) &&
            (!membership.roles.includes('owner') || membership.roles.includes(presidencyRole)),
        )
        .forEach((membership) => {
          serverDatabases.createDocument(
            appwriteVotingDatabase,
            appwriteVotesCollection,
            ID.unique(),
            {
              voter_id: membership.userId,
              poll_id: pollID,
              vote: 'Воздержусь',
            },
          )
        })
      res.status(200).json({ message: 'ok' })
    } else {
      res
        .status(403)
        .json({ message: 'Вы не суперюзер и не модератор голосования для этого мероприятия.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
