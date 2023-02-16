import { appName } from '@/constants/constants'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/24/outline'
import React from 'react'
import Section from '@/components/Section'
import { hamburgerMenuId } from '@/components/LayoutWithDrawer'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/20/solid'
import NinjaXUnion from '@/components/NinjaXUnion'

interface NavbarProps {
  sections?: Section[]
}

export default function Navbar(props: NavbarProps) {
  return (
    <div className='fixed w-full navbar bg-base-200 border-b border-base-300'>
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
            <NinjaXUnion />
            <div className='text-2xl tetx-bold'>{appName}</div>
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
