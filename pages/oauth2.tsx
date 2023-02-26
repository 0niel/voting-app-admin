import { useEffect } from 'react'
import { Account, Client } from 'appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import fetchJson from '@/lib/fetchJson'
import { useRouter } from 'next/router'
import useUser from '@/lib/useUser'
import { useAppwrite } from '@/context/AppwriteContext'

export default function () {
  const router = useRouter()
  const { mutateUser } = useUser()
  const { setClient } = useAppwrite()

  useEffect(() => {
    const client = new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId)
    setClient(client)
    new Account(client!).get().then((userData) => {
      mutateUser(
        fetchJson('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userData }),
        }),
        false,
      ).then(() => router.push('/admin/voting'))
    })
  }, [])

  return null
}
