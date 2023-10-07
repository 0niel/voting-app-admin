import { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, Query, Teams, Users } from 'node-appwrite'
import ObjectsToCsv from 'objects-to-csv'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListPollsLimit,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { mapAppwriteErrorToMessage } from '@/lib/errorMessages'
import { formatDate } from '@/lib/formatDate'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'

class ExportRow {
  eventID: string
  pollID: string
  pollQuestion: string
  pollIsFinished: string
  userName: string
  userEmail: string
  vote: string

  constructor(
    eventID: string,
    pollID: string,
    pollQuestion: string,
    pollIsFinished: boolean,
    userName: string,
    userEmail: string,
    vote: string,
  ) {
    this.eventID = eventID
    this.pollID = pollID
    this.pollQuestion = pollQuestion
    this.pollIsFinished = pollIsFinished ? 'finished' : 'in process'
    this.userName = userName
    this.userEmail = userEmail
    this.vote = vote
  }
}
export default async function exportEvent(req: NextApiRequest, res: NextApiResponse) {
  const { eventID, jwt } = req.query

  if (!eventID) {
    res.status(400).json({ message: 'Не указан eventID.' })
    return
  }
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt as string)

    // Получаем список членов команды.
    const isSuperuser = await new Teams(client)
      .list([Query.equal('$id', appwriteSuperUsersTeam)])
      .then((teamList) => teamList.total == 1)

    if (isSuperuser) {
      const databases = new Databases(client)
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)
      const serverUsers = new Users(server)
      const polls = (
        await databases.listDocuments(appwriteVotingDatabase, appwritePollsCollection, [
          Query.equal('event_id', eventID as string),
          Query.limit(appwriteListPollsLimit),
        ])
      ).documents as PollDocument[]
      const data = (
        await Promise.all(
          polls.map(async (poll) =>
            (
              (
                await databases.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
                  Query.equal('poll_id', poll.$id),
                  Query.limit(appwriteListVotesLimit),
                ])
              ).documents as VoteDocument[]
            ).map(async (vote) => {
              const user = await serverUsers.get(vote.voter_id)
              return new ExportRow(
                poll.event_id,
                poll.$id,
                poll.question,
                poll.is_finished,
                user.name,
                user.email,
                vote.vote,
              )
            }),
          ),
        )
      ).flatMap((row) => row)
      const csvRows = await Promise.all(data.map(async (row) => await row))
      res
        .status(200)
        .setHeader('Content-Type', 'text/csv')
        .setHeader('Content-Disposition', `attachment; filename=${eventID}.csv`)
        .send(await new ObjectsToCsv(csvRows).toString())
    } else {
      res.status(403).json({ message: 'Вы не является суперпользователем.' })
    }
  } catch (error) {
    res.status(500).json({ message: mapAppwriteErrorToMessage((error as Error).message) })
  }
}
