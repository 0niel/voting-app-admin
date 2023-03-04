import React, { FormEvent, useState } from 'react'
import AdminPanelHead from '@/components/Head'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import NinjaXUnion from './NinjaXUnion'
import Avatar from './profile/Avatar'
import fetchJson from '@/lib/fetchJson'
import useUser from '@/lib/useUser'
import { useAppwrite } from '@/context/AppwriteContext'
import { Account, AppwriteException } from 'appwrite'
import { toast } from 'react-hot-toast'

export interface LayoutProps {
  children: React.ReactNode
}

export const hamburgerMenuId = 'hamburger-menu'

const navigation = [
  { name: 'Дашборды', href: '/admin/dashboard', icon: HomeIcon, current: true },
  { name: 'Мероприятия', href: '/admin/events', icon: CalendarIcon },
]

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function LayoutWithDrawer(props: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const { mutateUser } = useUser()
  const { user } = useUser()
  const { client } = useAppwrite()

  async function logout(event: FormEvent) {
    event.preventDefault()
    try {
      await new Account(client).deleteSession('current')
    } catch (error: any) {
      if (error instanceof AppwriteException) {
      } // session does not exists
      else {
        toast.error(error.message)
      }
    } finally {
      await mutateUser(await fetchJson('/api/logout', { method: 'POST' }), false)
      await router.push('/login')
    }
  }

  // set current page in navigation
  navigation.forEach((item) => {
    item.current = router.pathname === item.href
  })

  return (
    <>
      <AdminPanelHead />
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as='div' className='relative z-40 md:hidden' onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter='transition-opacity ease-linear duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity ease-linear duration-300'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />
            </Transition.Child>

            <div className='fixed inset-0 z-40 flex'>
              <Transition.Child
                as={Fragment}
                enter='transition ease-in-out duration-300 transform'
                enterFrom='-translate-x-full'
                enterTo='translate-x-0'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='translate-x-0'
                leaveTo='-translate-x-full'
              >
                <Dialog.Panel className='relative flex w-full max-w-xs flex-1 flex-col bg-white'>
                  <Transition.Child
                    as={Fragment}
                    enter='ease-in-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in-out duration-300'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                  >
                    <div className='absolute top-0 right-0 -mr-12 pt-2'>
                      <button
                        type='button'
                        className='ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className='sr-only'>Закрыть меню</span>
                        <XMarkIcon className='h-6 w-6 text-white' aria-hidden='true' />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className='h-0 flex-1 overflow-y-auto pt-5 pb-4'>
                    <div className='flex flex-shrink-0 items-center px-4'>
                      <NinjaXUnion />
                    </div>
                    <nav className='mt-5 space-y-1 px-2'>
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            'group flex items-center rounded-md px-2 py-2 text-base font-medium',
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? 'text-gray-500'
                                : 'text-gray-400 group-hover:text-gray-500',
                              'mr-4 h-6 w-6 flex-shrink-0',
                            )}
                            aria-hidden='true'
                          />
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>

                  <div className=' dropdown-top dropdown-end dropdown mt-2 w-60 p-2'>
                    <label
                      tabIndex={0}
                      className='btn-ghost no-animation btn inline-block items-center normal-case'
                    >
                      {user && (
                        <div className='flex items-center'>
                          <a href='#' className='group block'>
                            <div className='flex items-center'>
                              <div>
                                <Avatar iconSize='2xl' fontSize='xl' />
                              </div>
                              <div className='ml-3'>
                                <p className='text-base font-medium text-gray-700 group-hover:text-gray-900'>
                                  {user.userData?.name}
                                </p>
                                <p className='text-sm font-medium text-gray-500 group-hover:text-gray-700'>
                                  {user.userData?.email}
                                </p>
                              </div>
                            </div>
                          </a>
                        </div>
                      )}
                    </label>
                    <ul
                      tabIndex={0}
                      className='dropdown-content menu mt-4 rounded-md bg-base-100 p-2 shadow ring-1 ring-base-200'
                    >
                      <li>
                        <button onClick={() => router.push('/admin/profile')}>
                          <UserCircleIcon className='h-6 w-6' />
                          <span>Профиль</span>
                        </button>
                      </li>
                      <li>
                        <button className='text-error' onClick={logout}>
                          <ArrowLeftOnRectangleIcon className='h-6 w-6' />
                          <span>Выйти</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className='w-14 flex-shrink-0'>
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <div className='hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col'>
          <div className='flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white'>
            <div className='flex flex-1 flex-col overflow-y-auto pt-5 pb-4'>
              <div className='flex flex-shrink-0 items-center px-4'>
                <NinjaXUnion />
              </div>
              <nav className='mt-5 flex-1 space-y-1 bg-white px-2'>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 h-6 w-6 flex-shrink-0',
                      )}
                      aria-hidden='true'
                    />
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            <div className='flex flex-shrink-0 border-t border-gray-200 p-2'>
              <div className='dropdown-end dropdown-top dropdown'>
                <label
                  tabIndex={0}
                  className='p-1/2 btn-ghost no-animation inline-block items-center rounded-md normal-case'
                >
                  {user && (
                    <div className='flex items-center justify-center'>
                      <a href='#' className='group block'>
                        <div className='flex items-center'>
                          <div>
                            <Avatar iconSize='2xl' fontSize='xl' />
                          </div>
                          <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>
                              {user.userData?.name}
                            </p>
                            <p className='text-xs font-medium text-gray-500 group-hover:text-gray-700'>
                              {user.userData?.email}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  )}
                </label>
                <ul
                  tabIndex={0}
                  className='dropdown-content menu mt-4 rounded-md bg-base-100 p-2 shadow ring-1 ring-base-200'
                >
                  <li>
                    <button onClick={() => router.push('/admin/profile')}>
                      <UserCircleIcon className='h-6 w-6' />
                      <span>Профиль</span>
                    </button>
                  </li>
                  <li>
                    <button className='text-error' onClick={logout}>
                      <ArrowLeftOnRectangleIcon className='h-6 w-6' />
                      <span>Выйти</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-1 flex-col md:pl-64'>
          <div className='sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden'>
            <button
              type='button'
              className='-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
              onClick={() => setSidebarOpen(true)}
            >
              <span className='sr-only'>Открыть меню</span>
              <Bars3Icon className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <main className='flex-1'>
            <div className='py-6 px-4 sm:px-6 lg:px-8'>{props.children}</div>
          </main>
        </div>
      </div>
    </>
  )
}
