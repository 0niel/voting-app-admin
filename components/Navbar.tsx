import { appName, shortAppName } from '@/constants/constants'
import Link from 'next/link'
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import React, { FormEvent } from 'react'
import Section from '@/components/Section'
import { hamburgerMenuId } from '@/components/LayoutWithDrawer'
import { useRouter } from 'next/router'
import fetchJson from '@/lib/fetchJson'
import useUser from '@/lib/useUser'
import { useAppwrite } from '@/context/AppwriteContext'
import Image from 'next/image'
import { Account } from 'appwrite'
import Avatar from '@/components/profile/Avatar'
import ProjectLogo from '@/components/logos/ProjectLogo'

interface NavbarProps {
  sections?: Section[]
}

export default function Navbar(props: NavbarProps) {
  const router = useRouter()
  const { mutateUser } = useUser()
  const { client } = useAppwrite()

  async function logout(event: FormEvent) {
    event.preventDefault()
    await new Account(client!)?.deleteSession('current')
    await mutateUser(await fetchJson('/api/logout', { method: 'POST' }), false)
    await router.push('/login')
  }

  return (
    <div className='fixed w-full navbar bg-base-200 border-b border-base-300'>
      <div className='navbar-start'>
        {props.sections && (
          <div className='flex-none lg:hidden'>
            <label htmlFor={hamburgerMenuId} className='btn btn-square btn-ghost'>
              <Bars3Icon className='h-6 w-6' />
            </label>
          </div>
        )}
        <div className='flex-1 mx-2'>
          <Link href='/' className='btn btn-ghost'>
            <div className='flex items-center text-xl normal-case'>
              <ProjectLogo className='w-6 h-6' />
              <div className='pl-2'>
                <span className='whitespace-nowrap hidden lg:block'>{appName}</span>
                <span className='whitespace-nowrap lg:hidden'>{shortAppName}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className='navbar-center'>
        <div className='flex-none hidden lg:block'>
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
        <div className='dropdown dropdown-end'>
          <label tabIndex={0} className='flex inline-block items-center btn btn-ghost normal-case'>
            <Avatar iconSize='w-8 h-8' fontSize='' />
            <ChevronDownIcon className='w-5 h-5 pt-0.5 stroke-2 text-slate-500 dark:text-slate-400' />
          </label>
          <ul
            tabIndex={0}
            className='dropdown-content menu p-2 shadow bg-base-100 rounded-box mt-4 ring-1 ring-secondary'
          >
            <li>
              <button onClick={() => router.push('/admin/profile')}>
                <UserCircleIcon className='w-6 h-6' />
                <span>Профиль</span>
              </button>
            </li>
            <li>
              <button className='text-error' onClick={logout}>
                <ArrowLeftOnRectangleIcon className='w-6 h-6' />
                <span>Выйти</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
