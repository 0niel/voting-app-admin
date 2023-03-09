import { Account } from 'appwrite'

import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import fetchJson from '@/lib/fetchJson'

export default function DeleteSuperuserModal() {
  const { membershipIDToDelete, setMembershipIDToDelete } = useMembership()
  const { client } = useAppwrite()
  const account = new Account(client)

  async function deleteParticipantFromDatabase() {
    const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
    await fetchJson('/api/teams/delete-superuser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userID: membershipIDToDelete,
        jwt,
      }),
    })
    setMembershipIDToDelete(undefined)
  }

  return (
    <Modal
      isOpen={membershipIDToDelete !== undefined}
      onAccept={deleteParticipantFromDatabase}
      acceptButtonName='Удалить'
      onCancel={() => setMembershipIDToDelete(undefined)}
      title='Удалить суперпользователя'
    />
  )
}
