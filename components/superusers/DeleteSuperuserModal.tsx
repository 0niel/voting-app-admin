import { Account } from 'appwrite'

import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import { handleFetchError } from '@/lib/handleFetchError'

export default function DeleteSuperuserModal() {
  const { membershipIDToDelete, setMembershipIDToDelete } = useMembership()
  const { client } = useAppwrite()
  const account = new Account(client)

  async function deleteParticipantFromDatabase() {
    const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
    await fetch('/api/teams/delete-superuser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userID: membershipIDToDelete,
        jwt,
      }),
    }).then(handleFetchError)
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
