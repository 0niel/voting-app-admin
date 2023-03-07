import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { PollDocument } from '@/lib/models/PollDocument'

function millisecondsToSeconds(milliseconds: number) {
  return Math.floor(milliseconds / 1000)
}

export default async function pollTimeLeft(req: NextApiRequest, res: NextApiResponse) {
  const { pollID, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const userID = (await new Account(client).get()).$id
    const databases = new Databases(client)
    const teams = new Teams(client)

    const poll = (await databases.getDocument(
      appwriteVotingDatabase,
      appwritePollsCollection,
      pollID,
    )) as PollDocument

    const now_time = millisecondsToSeconds(new Date().getTime())
    const start_time = millisecondsToSeconds(new Date(poll.start_at).getTime())
    const end_time = millisecondsToSeconds(new Date(poll.end_at).getTime())
    if (start_time < now_time && end_time > now_time) {
      res.status(200).json({ seconds: end_time - now_time, time: 'present' }) // time left
      return
    }
    if (start_time > now_time) {
      // future poll
      res.status(200).json({ seconds: start_time - now_time, time: 'future' })
      return
    }
    if (now_time >= end_time) {
      // past poll
      res.status(200).json({ seconds: now_time - end_time, time: 'past' })
      return
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
