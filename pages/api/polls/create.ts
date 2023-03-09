import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Permission, Query, Role, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(createPoll, sessionOptions)

async function createPoll(req: NextApiRequest, res: NextApiResponse) {
  const { question, startAt, endAt, eventID, pollOptions, jwt } = await req.body
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
      (await teams.list([Query.equal('$id', event.voting_moderators_team_id)])).total == 1

    if (isVotingModerator) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      await new Databases(server).createDocument(
        appwriteVotingDatabase,
        appwritePollsCollection,
        ID.unique(),
        {
          question: question,
          creator_id: userID,
          start_at: startAt,
          end_at: endAt,
          event_id: eventID,
          poll_options: pollOptions,
        },
        [
          Permission.read(Role.team(event!.participants_team_id)),
          Permission.read(Role.team(event!.voting_moderators_team_id)),
          Permission.update(Role.team(event!.voting_moderators_team_id)),
          Permission.delete(Role.team(event!.voting_moderators_team_id)),
        ],
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
