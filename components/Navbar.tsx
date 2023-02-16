import { appName } from '@/constants/constants'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/24/outline'
import React from 'react'
import Section from '@/components/Section'
import { hamburgerMenuId } from '@/components/LayoutWithDrawer'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/20/solid'

interface NavbarProps {
  sections?: Section[]
}

export default function Navbar(props: NavbarProps) {
  return (
    <div className='fixed w-full navbar bg-base-300'>
      {props.sections && (
        <div className='flex-none lg:hidden'>
          <label htmlFor={hamburgerMenuId} className='btn btn-square btn-ghost'>
            <Bars3Icon className='h-6 w-6' />
          </label>
        </div>
      )}
      <div className='flex-1 px-2 mx-2'>
        <Link href='/'>
          <div className='flex items-center'>
            <Image
              src='/mirea-ninja-logo.svg'
              alt='Логотип Mirea Ninja'
              width={45}
              height={45}
              className='w-30 h-30'
            />
            <XMarkIcon className='px-1 h-7 w-7' />
            <Image
              src='/student-union-logo.png'
              alt='Логотип студенческого союза РТУ МИРЭА'
              width={55}
              height={55}
              className='w-30 h-30 pr-2'
            />
            {appName}
          </div>
        </Link>
      </div>
      <div className='flex-none hidden lg:block'>
        <ul className='menu menu-horizontal'>
          {props.sections &&
            props.sections.map((section, index) => (
              <li key={index}>
                <Link href={section.path}>{section.name}</Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
