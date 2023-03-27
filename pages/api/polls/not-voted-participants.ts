import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, Models, Query, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListMembershipsLimit,
  appwriteListTeamsLimit,
  appwriteListVotesLimit,
  appwriteProjectId,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'
import { participantFilter } from '@/lib/participantFilter'

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
      const event = (await databases.getDocument(
        appwriteVotingDatabase,
        appwriteEventsCollection,
        eventID,
      )) as EventDocument
      const serverTeams = new Teams(server)
      const serverDatabases = new Databases(client)

      const membershipList = await serverTeams.listMemberships(event.participants_team_id, [
        Query.limit(appwriteListMembershipsLimit),
      ])
      const voters = membershipList.memberships.filter((membership) =>
        participantFilter(membership),
      ) as Models.Membership[]

      const votes = (
        await serverDatabases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
          Query.limit(appwriteListVotesLimit),
          Query.equal('poll_id', pollID),
        ])
      ).documents as VoteDocument[]

      const votedParticipantIDs = votes.map((vote) => vote.voter_id)
      const notVotedParticipantNames = voters
        .filter((membership) => !votedParticipantIDs.includes(membership.userId))
        .map((membership) => membership.userName)

      res.status(200).json(notVotedParticipantNames)
    } else {
      res
        .status(403)
        .json({ message: 'Вы не суперюзер и не модератор голосования для этого мероприятия.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
