import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, MouseEventHandler, useRef } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

interface ModalProps {
  isOpen: boolean
  onAccept: MouseEventHandler<HTMLButtonElement>
  acceptButtonName: string
  onCancel: () => {}
  cancelButtonName?: string
  title: string
  children?: React.ReactNode
}

export default function Modal(props: ModalProps) {
  const dialogPanelRef = useRef(null)

  useOnClickOutside(dialogPanelRef, () => {
    props.onCancel()
  })

  return (
    <Transition appear show={props.isOpen} as={Fragment}>
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
                className='rounded-box w-full max-w-md transform bg-base-100 p-6 text-left align-middle ring-1 ring-secondary transition-all hover:ring-2 hover:ring-secondary-focus'
              >
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  {props.title}
                </Dialog.Title>
                {props.children}
                <div className='mt-6 flex justify-end'>
                  <button type='button' className='btn-primary btn' onClick={props.onCancel}>
                    {props.cancelButtonName || 'Отменить'}
                  </button>
                  <button
                    type='button'
                    className='btn-outline btn-primary btn'
                    onClick={props.onAccept}
                  >
                    {props.acceptButtonName}
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
