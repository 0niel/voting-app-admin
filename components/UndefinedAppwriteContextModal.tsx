import { useAppwrite } from '@/context/AppwriteContext'
import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'

export default function UndefinedAppwriteContextModal() {
  const { client } = useAppwrite()
  const router = useRouter()

  return (
    <Transition appear show={client === undefined} as={Fragment}>
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
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title as='h3' className='text-lg font-medium leading-6'>
                  Сессия недействительна
                </Dialog.Title>
                <div className='mt-2'>
                  <p className='text-sm text-slate-500'>Введите учетные данные заново.</p>
                </div>

                <div className='mt-4'>
                  <button
                    type='button'
                    className='btn btn-primary px-4 py-2'
                    onClick={async () => {
                      await router.push('/login')
                    }}
                  >
                    Войти
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
