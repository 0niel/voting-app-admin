import React, { useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Section from '@/components/Section'
import AdminPanelHead from '@/components/Head'
import { useOnClickOutside } from 'usehooks-ts'
import { ChartBarIcon, Cog8ToothIcon } from '@heroicons/react/24/outline'

export interface LayoutProps {
  children: React.ReactNode
}

export const hamburgerMenuId = 'hamburger-menu'

const sections: Section[] = [
  { name: 'Голосование', path: '/admin/voting', icon: <ChartBarIcon className='w-6 h-6' /> },
  { name: 'Настройки', path: '/admin/settings', icon: <Cog8ToothIcon className='w-6 h-6' /> },
]
export default function LayoutWithDrawer(props: LayoutProps) {
  const sidebarRef = useRef(null)
  const [open, setOpen] = useState(false)

  useOnClickOutside(sidebarRef, () => setOpen(false))

  return (
    <>
      <AdminPanelHead />
      <main className='drawer'>
        <input
          id={hamburgerMenuId}
          checked={open}
          type='checkbox'
          className='drawer-toggle'
          onChange={(event) => setOpen(event.target.checked)}
        />
        <div className='drawer-content flex flex-col'>
          <Navbar sections={sections} />
          <div className='mx-auto px-4 sm:px-6 lg:px-8 pt-16 max-w-7xl'>{props.children}</div>
        </div>
        <div className='drawer-side'>
          <label className='drawer-overlay' />
          <ul className='menu p-4 w-2/3 md:w-80 bg-base-100' ref={sidebarRef}>
            {/*Sidebar content here*/}
            {sections.map((section, index) => (
              <li key={index} onClick={() => setOpen(false)}>
                <Link href={section.path}>
                  {section.icon}
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
