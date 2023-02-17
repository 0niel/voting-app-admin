import { appName, shortAppName } from '@/constants/constants'
import Link from 'next/link'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline'
import React from 'react'
import Section from '@/components/Section'
import { hamburgerMenuId } from '@/components/LayoutWithDrawer'
import NinjaXUnion from '@/components/NinjaXUnion'
import { useRecoilState } from 'recoil'
import { appwrite, userState } from '@/store/global'

interface NavbarProps {
  sections?: Section[]
}

export default function Navbar(props: NavbarProps) {
  const [user, setUser] = useRecoilState(userState)

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
        <div className='flex-1 px-2 mx-2'>
          <Link href='/'>
            <div className='flex items-center text-xl'>
              <NinjaXUnion />
              <div className='visible md:invisible md:w-0 md:h-0'>{shortAppName}</div>
              <div className='invisible w-0 h-0 md:visible md:w-fit md:h-fit'>{appName}</div>
            </div>
          </Link>
        </div>
      </div>
      <div className='navbar-center'>
        <div className='flex-none hidden lg:block'>
          <ul className='menu menu-horizontal rounded-box'>
            {props.sections &&
              props.sections.map((section, index) => (
                <li key={index}>
                  <Link href={section.path}>{section.name}</Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className='navbar-end'>
        <div className='dropdown dropdown-end dropdown-hover'>
          <label tabIndex={0} className='m-1 flex inline-block items-center'>
            {user?.name ?? 'Пользователь'}
            <ChevronDownIcon className='w-6 h-6 pt-1' />
          </label>
          <ul
            tabIndex={0}
            className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40'
          >
            <li>
              <button className='btn btn-outline btn-error'>Выйти</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
