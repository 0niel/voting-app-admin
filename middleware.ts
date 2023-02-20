import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session/edge'
import { sessionOptions } from 'lib/session'

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next()
  const session = await getIronSession(req, res, sessionOptions)

  // do anything with session here:
  const { user } = session
  if (!user?.session) {
    return new NextResponse(null, { status: 403 })
  }

  return res
}

export const config = {
  matcher: '/admin',
}