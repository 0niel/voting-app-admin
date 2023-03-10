import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteProjectId,
  appwriteSuperUsersTeam,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(createVote, sessionOptions)

async function createVote(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, pollId, vote, jwt } = await req.body

  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setJWT(jwt)

  const account = new Account(client)

  const userId = await (await account.get()).$id

  const teams = new Teams(client)
  const memberships = await teams.listMemberships(appwriteSuperUsersTeam)

  try {
    const isSuperUser = memberships.memberships.some((membership) => membership.userId === userId)

    // Получаем информацию о событии из базы данных
    const database = new Databases(client)
    const event: EventDocument = await database.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      eventId,
    )
    const poll: PollDocument = await database.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      pollId,
    )

    // Проверяем, является ли пользователь участником события
    const participantMembership = await teams.listMemberships(event.participants_team_id)
    const isParticipant = participantMembership.memberships.some(
      (membership) => membership.userId === userId,
    )
    if (isSuperUser || isParticipant) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)
      const serverDatabase = new Databases(server)

      // Проверяем, что `vote` соответсвтует одному из poll.vote_options
      const isVoteValid = poll.poll_options.some((option) => option === vote)

      if (!isVoteValid) {
        res.status(400).json({ message: 'Вариант ответа не соответствует вариантам голосования.' })
        return
      }

      // Проверяем, что пользователь еще не голосовал
      const votes = await database.listDocuments(appwriteVotingDatabase, appwriteEventsCollection, [
        `user_id=${userId}`,
        `poll_id=${pollId}`,
      ])

      if (votes.total > 0) {
        // Пользователь уже голосовал, обновляем его голос
        const voteDocument: VoteDocument = votes.documents[0] as VoteDocument
        voteDocument.vote = vote

        const voteId = await serverDatabase.updateDocument(
          appwriteVotingDatabase,
          appwriteVotesCollection,
          voteDocument.$id,
          voteDocument,
        )
        if (!voteId) {
          res.status(500).json({ message: 'Не удалось обновить голос.' })
          return
        }
        return
      }

      // Создаем голос пользователя
      const voteDocument = {
        voter_id: userId,
        poll_id: pollId,
        vote: vote,
      }

      const voteId = await serverDatabase.createDocument(
        appwriteVotingDatabase,
        appwriteVotesCollection,
        ID.unique(),
        voteDocument,
      )
      if (!voteId) {
        res.status(500).json({ message: 'Не удалось создать голос.' })
        return
      }

      res.status(200).json({ message: 'ok' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
