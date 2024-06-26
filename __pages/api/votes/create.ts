import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
import { Account, Client, Databases, ID, Permission, Query, Role, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListMembershipsLimit,
  appwriteListVotesLimit,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteVotesCollection,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { mapAppwriteErrorToMessage } from '@/lib/errorMessages'
import { EventDocument } from '@/lib/models/EventDocument'
import { PollDocument } from '@/lib/models/PollDocument'
import { VoteDocument } from '@/lib/models/VoteDocument'
import { participantFilter } from '@/lib/participantFilter'

export default async function createVote(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
  const { eventId, pollId, vote, jwt } = await req.body

  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)
    .setJWT(jwt)

  const account = new Account(client)

  const userId = (await account.get()).$id

  const teams = new Teams(client)

  try {
    // Получаем информацию о мероприятии из базы данных
    const database = new Databases(client)
    const event: EventDocument = await database.getDocument(
      appwriteVotingDatabase,
      appwriteEventsCollection,
      eventId,
    )
    const poll: PollDocument = await database.getDocument(
      appwriteVotingDatabase,
      appwritePollsCollection,
      pollId,
    )

    const isPollActive =
      poll.start_at &&
      poll.end_at &&
      new Date(poll.start_at) < new Date() &&
      new Date(poll.end_at) > new Date() &&
      !poll.is_finished
    if (!isPollActive) {
      res.status(400).json({ message: 'Голосование не активно.' })
      return
    }

    // Проверяем, является ли пользователь участником мероприятия или председателем
    const isParticipantOrPresidency =
      (
        await teams.listMemberships(event.participants_team_id, [
          Query.limit(appwriteListMembershipsLimit),
        ])
      ).memberships.find(
        (membership) => participantFilter(membership) && membership.userId === userId,
      ) !== undefined

    if (isParticipantOrPresidency) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const serverDatabase = new Databases(server)
      const serverTeams = new Teams(server)

      // Проверяем, что `vote` соответсвтует одному из poll.vote_options
      const isVoteValid = poll.poll_options.some((option) => option === vote)

      if (!isVoteValid) {
        res.status(400).json({ message: 'Вариант ответа не соответствует вариантам голосования.' })
        return
      }

      // Проверяем, что пользователь еще не голосовал
      const votes = await database.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
        Query.equal('voter_id', userId),
        Query.equal('poll_id', pollId),
        Query.limit(appwriteListVotesLimit),
      ])

      if (votes.total > 0) {
        // возвращаем ошибку, если пользователь уже голосовал. Изменить эти строчки, если нужно
        // позволить пользователю изменять свой голос
        res.status(400).json({ message: 'Вы уже голосовали.' })
        return

        // console.log(`Пользователь уже голосовал: ${JSON.stringify(votes)}!`)
        // // Пользователь уже голосовал, обновляем его голос
        // const voteDocument: VoteDocument = votes.documents[0] as VoteDocument
        // voteDocument.vote = vote
        //
        // const voteId = await serverDatabase.updateDocument(
        //   appwriteVotingDatabase,
        //   appwriteVotesCollection,
        //   voteDocument.$id,
        //   {
        //     vote: vote,
        //   },
        // )
        //
        // if (!voteId) {
        //   res.status(500).json({ message: 'Не удалось обновить голос.' })
        //   return
        // }
        //
        // res.status(200).json({ message: 'ok' })
        // return
      }

      // Создаем голос пользователя
      const voteDocument = {
        voter_id: userId,
        poll_id: pollId,
        vote: vote,
      }

      console.log(`Vote: ${JSON.stringify(voteDocument)}`)

      await serverDatabase.createDocument(
        appwriteVotingDatabase,
        appwriteVotesCollection,
        ID.unique(),
        voteDocument,
        [
          Permission.read(Role.team(event.access_moderators_team_id)),
          Permission.read(Role.team(event.voting_moderators_team_id)),
          Permission.read(Role.team(event.participants_team_id)),
        ],
      )

      // autocomplete poll
      const votedParticipantIDs = (
        (
          await serverDatabase.listDocuments(appwriteVotingDatabase, appwriteVotesCollection, [
            Query.equal('poll_id', pollId),
            Query.limit(appwriteListVotesLimit),
          ])
        ).documents as VoteDocument[]
      ).map((vote) => vote.voter_id)
      const allParticipantIDs = (
        await serverTeams.listMemberships(event.participants_team_id, [
          Query.limit(appwriteListMembershipsLimit),
        ])
      ).memberships
        .filter(participantFilter)
        .map((membership) => membership.userId)
      const toFinishPoll = allParticipantIDs.every((id) => votedParticipantIDs.includes(id))
      if (toFinishPoll) {
        await serverDatabase.updateDocument(
          appwriteVotingDatabase,
          appwritePollsCollection,
          pollId,
          {
            end_at: new Date().toISOString(),
            is_finished: true,
          },
        )
      }

      res.status(200).json({ message: 'ok' })
    } else {
      res
        .status(403)
        .json({ message: 'Пользователь не является председателем или участником голосования' })
    }
  } catch (error) {
    res.status(500).json({ message: mapAppwriteErrorToMessage((error as Error).message) })
  }
}
