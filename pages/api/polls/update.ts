import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, Query, Teams } from 'node-appwrite'

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
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(updatePoll, sessionOptions)

async function updatePoll(req: NextApiRequest, res: NextApiResponse) {
  const { question, startAt, endAt, duration, eventID, pollOptions, pollID, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const userID = (await new Account(client).get()).$id
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

      // delete votes if option does not exist
      ;(
        (
          await databases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
            Query.equal('poll_id', pollID),
            Query.limit(appwriteListVotesLimit),
          ])
        ).documents as PollDocument[]
      )
        .filter((vote) => !pollOptions.includes(vote.vote))
        .forEach((vote) => {
          databases.deleteDocument(appwriteVotingDatabase, appwriteVotesCollection, vote.$id)
        })

      await new Databases(server).updateDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        pollID,
        {
          question: question,
          creator_id: userID,
          start_at: startAt,
          end_at: endAt,
          duration,
          event_id: eventID,
          poll_options: pollOptions,
        } as PollDocument,
      )
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
