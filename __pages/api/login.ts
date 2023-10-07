import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'

import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(loginRoute, sessionOptions)

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { userData } = await req.body

  try {
    req.session.user = {
      isLoggedIn: true,
      userData,
    }
    await req.session.save()
    res.status(200).json({ message: 'ok' })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}
