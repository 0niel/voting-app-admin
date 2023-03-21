import { Account } from 'appwrite'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import CreateMembershipModalContent from '@/components/modal/CreateMembershipModalContent'
import Modal from '@/components/modal/Modal'
import { useAppwrite } from '@/context/AppwriteContext'
import { useMembership } from '@/context/MembershipContext'
import fetchJson from '@/lib/fetchJson'

export default function CreateSuperuserModal() {
  const { createMembership, setCreateMembership } = useMembership()
  const [email, setEmail] = useState('')
  const [isPresidency, setPresidency] = useState(false)
  const { client } = useAppwrite()
  const account = new Account(client)

  async function addSuperuser() {
    try {
      const newEmail = email?.trim()
      if (newEmail && newEmail.length > 0) {
        const jwt = await account.createJWT().then((jwtModel) => jwtModel.jwt)
        await fetchJson('/api/teams/create-superuser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newEmail,
            roles: isPresidency ? ['presidency'] : [],
            jwt,
          }),
        })
        setEmail('')
        setCreateMembership(false)
      } else {
        toast.error('Укажите действительную почту.')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      isOpen={createMembership}
      onAccept={addSuperuser}
      acceptButtonName='Пригласить'
      onCancel={() => setCreateMembership(false)}
      title='Пригласить участника'
    >
      <CreateMembershipModalContent email={email} setEmail={setEmail} />
      <div className='form-control'>
        <label className='label cursor-pointer'>
          <span className='label-text'>Является председателем</span>
          <input
            type='checkbox'
            checked={isPresidency}
            onChange={(event) => setPresidency(event.target.checked)}
            className='checkbox-primary checkbox'
          />
        </label>
      </div>
    </Modal>
  )
}
