import React from 'react'

interface CreateTeamModalContentProps {
  email: string
  setEmail: Function
}

export default function CreateMembershipModalContent(props: CreateTeamModalContentProps) {
  return (
    <div className='form-control w-full max-w-xs pt-5'>
      <label className='label'>
        <span className='label-text'>Email</span>
      </label>
      <input
        type='text'
        value={props.email}
        onChange={(e) => props.setEmail(e.target.value)}
        className='block w-full rounded-lg border border-base-200 bg-gray-50 p-2.5 text-sm text-neutral focus:border-secondary focus:ring-secondary'
      />
    </div>
  )
}
