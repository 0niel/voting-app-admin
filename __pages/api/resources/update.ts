import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Client, Databases, ID, Permission, Query, Role, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteEventsCollection,
  appwriteListTeamsLimit,
  appwritePollsCollection,
  appwriteProjectId,
  appwriteResourcesCollection,
  appwriteSuperUsersTeam,
  appwriteVotingDatabase,
} from '@/constants/constants'
import { EventDocument } from '@/lib/models/EventDocument'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(updateResource, sessionOptions)

async function updateResource(req: NextApiRequest, res: NextApiResponse) {
  const { name, url, eventID, svgIcon, resourceID, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    const isSuperuser = await new Teams(client)
      .list([Query.equal('$id', appwriteSuperUsersTeam)])
      .then((teamList) => teamList.total == 1)
    if (isSuperuser) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)
      await new Databases(server).updateDocument(
        appwriteVotingDatabase,
        appwriteResourcesCollection,
        resourceID,
        {
          name: name,
          url: url,
          event_id: eventID,
          svg_icon: svgIcon,
        },
      )
      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'Вы не являетесь суперпользователем' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
