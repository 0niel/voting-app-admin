import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, Query, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListTeamsLimit,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'

export default async function deletePoll(req: NextApiRequest, res: NextApiResponse) {
  const { eventID, pollID, jwt } = await req.body
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
      await serverDatabases.deleteDocument(appwriteVotingDatabase, appwritePollsCollection, pollID)

      // delete votes if option does not exist
      ;(
        (
          await serverDatabases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
            Query.equal('poll_id', pollID),
            Query.limit(appwriteListVotesLimit),
          ])
        ).documents as PollDocument[]
      ).forEach((vote) => {
        databases.deleteDocument(appwriteVotingDatabase, appwriteVotesCollection, vote.$id)
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
