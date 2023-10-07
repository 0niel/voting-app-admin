import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Query, Teams } from 'node-appwrite'

import {
  appwriteEndpoint,
  appwriteListTeamsLimit,
  appwriteProjectId,
  appwriteSuperUsersTeam,
} from '@/constants/constants'

export function handleAlreadyInvitedException(error: any) {
  console.log(error.message)
  if (error.message === 'User has already been invited or is already a member of this team') {
  } else {
    // throw Error(error.message)
  }
}

export default async function createSuperuser(req: NextApiRequest, res: NextApiResponse) {
  const { email, roles, jwt } = await req.body
  try {
    const client = new Client()
      .setEndpoint(appwriteEndpoint)
      .setProject(appwriteProjectId)
      .setJWT(jwt)

    // Получаем список членов команды.
    const isSuperuser = await new Teams(client)
      .list([Query.equal('$id', appwriteSuperUsersTeam)])
      .then((teamList) => teamList.total == 1)

    if (isSuperuser) {
      const server = new Client()
        .setEndpoint(appwriteEndpoint)
        .setProject(appwriteProjectId)
        .setKey(process.env.APPWRITE_API_KEY!)

      const serverTeams = new Teams(server)
      const teams = (
        await serverTeams.list([
          Query.notEqual('$id', appwriteSuperUsersTeam),
          Query.limit(appwriteListTeamsLimit),
        ])
      ).teams

      // invite in all teams
      teams.map(async (team) => {
        try {
          await serverTeams.createMembership(
            team.$id,
            email,
            ['owner', ...roles],
            process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME!,
          )
        } catch (error: any) {
          handleAlreadyInvitedException(error)
        }
      })

      // finally invite in superusers' team
      try {
        await serverTeams.createMembership(
          appwriteSuperUsersTeam,
          email,
          roles,
          process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME!,
        )
      } catch (error: any) {
        handleAlreadyInvitedException(error)
      }

      res.status(200).json({ message: 'ok' })
    } else {
      res.status(403).json({ message: 'You cannot invite new superusers.' })
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}