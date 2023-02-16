import React, { useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Section from '@/components/Section'
import AdminPanelHead from '@/components/Head'
import { useOnClickOutside } from 'usehooks-ts'

export interface LayoutProps {
  children: React.ReactNode
}

export const hamburgerMenuId = 'hamburger-menu'

const sections: Section[] = [
  { name: 'Голосование', path: '/voting' },
  { name: 'Настройки', path: '/settings' },
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
        <div className='fixed drawer-content flex flex-col'>
          <Navbar sections={sections} />
          <div className='mx-auto px-4 sm:px-6 lg:px-8 pt-16 max-w-7xl'>{props.children}</div>
        </div>
        <div className='drawer-side'>
          <label htmlFor='my-drawer-3' className='drawer-overlay' />
          <ul className='menu p-4 w-80 bg-base-100' ref={sidebarRef}>
            {/*Sidebar content here*/}
            {sections.map((section, index) => (
              <li key={index} onClick={() => setOpen(false)}>
                <Link href={section.path}>{section.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
