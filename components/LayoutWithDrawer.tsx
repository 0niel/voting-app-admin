import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Section from '@/components/Section'
import AdminPanelHead from '@/components/Head'
import { useOnClickOutside } from 'usehooks-ts'
import { CalendarIcon, Cog8ToothIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { useAppwrite } from '@/context/AppwriteContext'
import { Account, Client } from 'appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import fetchJson from '@/lib/fetchJson'
import useUser from '@/lib/useUser'

export interface LayoutProps {
  children: React.ReactNode
}

export const hamburgerMenuId = 'hamburger-menu'

const sections: Section[] = [
  {
    name: 'Голосование',
    path: '/admin/voting',
    icon: <PresentationChartLineIcon className='h-6 w-6' />,
  },
  { name: 'События', path: '/admin/events', icon: <CalendarIcon className='h-6 w-6' /> },
  // { name: 'Настройки', path: '/admin/settings', icon: <Cog8ToothIcon className='w-6 h-6' /> },
]
export default function LayoutWithDrawer(props: LayoutProps) {
  const sidebarRef = useRef(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { client, setClient } = useAppwrite()
  const { mutateUser } = useUser()

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
          <div className='mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8'>{props.children}</div>
          <Navbar sections={sections} />
        </div>
        <div className='drawer-side'>
          <label className='drawer-overlay' />
          <ul className='menu w-60 bg-base-100 p-4' ref={sidebarRef}>
            {/*Sidebar content here*/}
            {sections.map((section, index) => (
              <li key={index} onClick={() => setOpen(false)}>
                <Link
                  href={section.path}
                  className={`${router.pathname.startsWith(section.path) && 'active'}`}
                >
                  {section.icon}
                  {section.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Toaster position='bottom-right' />
      </main>
    </>
  )
}
