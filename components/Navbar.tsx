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
    <div className='navbar fixed w-full border-b border-base-300 bg-base-200'>
      <div className='navbar-start'>
        {props.sections && (
          <div className='flex-none lg:hidden'>
            <label htmlFor={hamburgerMenuId} className='btn-ghost btn-square btn'>
              <Bars3Icon className='h-6 w-6' />
            </label>
          </div>
        )}
        <div className='mx-2 flex-1'>
          <Link href='/' className='btn-ghost btn'>
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
          <label tabIndex={0} className='btn-ghost btn inline-block flex items-center normal-case'>
            <Avatar iconSize='w-8 h-8' fontSize='' />
            <ChevronDownIcon className='h-5 w-5 stroke-2 pt-0.5 text-slate-500 dark:text-slate-400' />
          </label>
          <ul
            tabIndex={0}
            className='dropdown-content menu rounded-box mt-4 bg-base-100 p-2 shadow ring-1 ring-secondary'
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
