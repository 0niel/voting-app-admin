import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Account, AppwriteException } from 'appwrite'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { FormEvent } from 'react'
import { toast } from 'react-hot-toast'

import { hamburgerMenuId } from '@/components/LayoutWithDrawer'
import ProjectLogo from '@/components/logos/ProjectLogo'
import Avatar from '@/components/profile/Avatar'
import Section from '@/components/Section'
import { appName, shortAppName } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import fetchJson from '@/lib/fetchJson'
import useUser from '@/lib/useUser'

interface NavbarProps {
  sections?: Section[]
}

export default function Navbar(props: NavbarProps) {
  const router = useRouter()
  const { mutateUser } = useUser()
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

  return (
    <div className='navbar fixed w-full border-b border-base-200 bg-opacity-30 backdrop-blur-sm backdrop-filter'>
      <div className='navbar-start'>
        {props.sections && (
          <div className='flex-none lg:hidden'>
            <label htmlFor={hamburgerMenuId} className='btn-ghost no-animation btn-square btn'>
              <Bars3Icon className='h-6 w-6' />
            </label>
          </div>
        )}
        <div className='mx-2 flex-1'>
          <Link href='/' className='btn-ghost no-animation btn'>
            <div className='flex items-center text-xl normal-case'>
              <ProjectLogo className='h-6 w-6' />
              <div className='pl-2'>
                <span className='hidden whitespace-nowrap lg:block'>{appName}</span>
                <span className='whitespace-nowrap lg:hidden'>{shortAppName}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className='navbar-center'>
        <div className='hidden flex-none lg:block'>
          {props.sections && (
            <ul className='tabs tabs-boxed'>
              {props.sections.map((section, index) => (
                <li key={index}>
                  <Link
                    href={section.path}
                    className={`tab ${router.pathname.startsWith(section.path) && 'tab-active'}`}
                  >
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className='navbar-end'>
        <div className='dropdown-end dropdown'>
          <label
            tabIndex={0}
            className='btn-ghost no-animation btn inline-block flex items-center normal-case'
          >
            <Avatar iconSize='w-5 h-5' fontSize='text-xs' />
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fillRule='evenodd'
              clipRule='evenodd'
              viewBox='0 0 512 345.51'
              className='ml-1 h-2 w-2 stroke-2 pt-0.5 text-base-content'
            >
              <path
                fillRule='nonzero'
                d='m3.95 30.57 236.79 307.24c1.02 1.39 2.24 2.65 3.67 3.75 8.27 6.39 20.17 4.87 26.56-3.41l236.11-306.4C510.14 28.38 512 23.91 512 19c0-10.49-8.51-19-19-19H18.93v.06A18.9 18.9 0 0 0 7.36 4.01C-.92 10.4-2.44 22.3 3.95 30.57z'
              />
            </svg>
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
  )
}
