import { Account, Client } from 'appwrite'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import LayoutWithDrawer from '@/components/LayoutWithDrawer'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import fetchJson from '@/lib/fetchJson'
import useUser from '@/lib/useUser'

export default function OAuth2() {
  const router = useRouter()
  const { mutateUser } = useUser()
  const { client } = useAppwrite()

  useEffect(() => {
    const account = new Account(client)
    account.get().then(async (userData) => {
      const jwt = await account.createJWT().then((r) => r.jwt)
      mutateUser(
        fetchJson('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userData, jwt }),
        }),
        false,
      ).then(() => router.push('/admin/dashboard'))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LayoutWithDrawer>
      <div>Перенаправление...</div>
    </LayoutWithDrawer>
  )
}
