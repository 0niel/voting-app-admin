import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Models, Teams } from 'appwrite'
import { useAppwrite } from '@/context/AppwriteContext'
import { toast } from 'react-hot-toast'
import { useOnClickOutside } from 'usehooks-ts'
import { useMembership } from '@/context/MembershipContext'

export default function DeleteMembershipModal() {
  const dialogPanelRef = useRef(null)
  const {
    membershipIDToDelete,
    setMembershipIDToDelete,
    teamIDRelatedToMembershipToDelete,
    setTeamIDRelatedToMembershipToDelete,
    postDeleteAction,
    setPostDeleteAction,
  } = useMembership()
  const [membershipToDelete, setMembershipToDelete] = useState<Models.Membership>()
  const { client } = useAppwrite()

  useOnClickOutside(dialogPanelRef, () => {
    setMembershipIDToDelete(undefined)
    setTeamIDRelatedToMembershipToDelete(undefined)
    setPostDeleteAction(undefined)
  })

  useEffect(() => {
    try {
      if (membershipIDToDelete !== undefined && teamIDRelatedToMembershipToDelete !== undefined) {
        new Teams(client!)
          .getMembership(teamIDRelatedToMembershipToDelete, membershipIDToDelete)
          .then((membership) => {
            setMembershipToDelete(membership)
          })
      }
    } catch (error: any) {
      toast.error(error.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipIDToDelete])

  async function deleteMembership() {
    try {
      await new Teams(client!).deleteMembership(
        teamIDRelatedToMembershipToDelete!,
        membershipIDToDelete!,
      )
      await postDeleteAction()
    } catch (error: any) {
      toast.error(error.message)
    }
    setMembershipIDToDelete(undefined)
    setTeamIDRelatedToMembershipToDelete(undefined)
    setPostDeleteAction(() => {})
  }

  return (
    <Transition
      appear
      show={teamIDRelatedToMembershipToDelete !== undefined && membershipIDToDelete !== undefined}
      as={Fragment}
    >
      <Dialog as='div' className='relative z-10' onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel
                ref={dialogPanelRef}
                className='w-full max-w-md transform overflow-hidden bg-base-100 rounded-box p-6 text-left align-middle transition-all ring-1 ring-secondary'
              >
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  Вы уверены, что хотите исключить из команды пользователя{' '}
                  <span className='text-info'>
                    {membershipToDelete?.userName} {membershipToDelete?.userEmail}
                    <span className='font-light text-sm'> {membershipToDelete?.$id.slice(-7)}</span>
                  </span>
                  ?
                </Dialog.Title>
                <div className='mt-6 justify-end flex'>
                  <div className='mr-2'>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={() => {
                        setPostDeleteAction(() => {})
                        setMembershipIDToDelete(undefined)
                        setTeamIDRelatedToMembershipToDelete(undefined)
                      }}
                    >
                      Отменить
                    </button>
                  </div>
                  <button
                    type='button'
                    className='btn btn-error btn-outline'
                    onClick={deleteMembership}
                  >
                    Удалить
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
