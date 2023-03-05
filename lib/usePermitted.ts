import { Models } from 'appwrite'

import useUser from '@/lib/useUser'

export default function usePermitted(memberships: Models.Membership[]) {
  const { user } = useUser()

  return (
    memberships.filter(
      (membership) =>
        membership.userId === user?.userData?.$id && membership.roles.includes('owner'),
    ).length > 0
  )
}
