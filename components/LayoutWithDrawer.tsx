'use client'

import { useRouter, usePathname } from 'next/navigation'
import React, { FormEvent } from 'react'

import {
  CalendarIcon,
  DownloadCloudIcon,
  FileTextIcon,
  Link as LinkIcon,
  MenuIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useSupabase } from '@/lib/supabase/supabase-provider'
import { Session } from '@supabase/supabase-js'
import { Button } from './ui/button'
import { Database } from '@/lib/supabase/db-types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { CaretSortIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export interface LayoutProps {
  children: React.ReactNode
  session: Session | null
  superusers: Database['ovk']['Tables']['superusers']['Row'][] | null
}

interface NavigationItemI {
  name: string
  href: string
  icon: any
  current?: boolean
}

const navigation: NavigationItemI[] = [
  { name: 'Мероприятия', href: '/admin/events', icon: CalendarIcon, current: true },
]

const superuserNavigation: NavigationItemI[] = [
  {
    name: 'Суперпользователи',
    href: '/admin/superusers',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Ресурсы',
    href: '/admin/resources',
    icon: FileTextIcon,
  },
  {
    name: 'Экспорт',
    href: '/admin/export',
    icon: DownloadCloudIcon,
  },
]

function DrawerContent({ isSuperuser }: { isSuperuser: boolean }) {
  const path = usePathname()

  return (
    <div className='space-y-4 py-4'>
      <div className='px-3 py-2'>
        <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>ОВК Админка</h2>
        <div className='space-y-1'>
          {navigation.map((item) => (
            <Link href={item.href} key={item.name} passHref={true}>
              <Button
                key={item.name}
                variant={path.includes(item.href) ? 'secondary' : 'ghost'}
                className='w-full justify-start'
              >
                <item.icon className='mr-2 h-4 w-4' />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      {isSuperuser && (
        <div className='px-3 py-2'>
          <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Суперпользователям</h2>
          <div className='space-y-1'>
            {superuserNavigation.map((item) => (
              <Link href={item.href} key={item.name} passHref={true}>
                <Button
                  key={item.name}
                  variant={path.includes(item.href) ? 'secondary' : 'ghost'}
                  className='w-full justify-start'
                >
                  <item.icon className='mr-2 h-4 w-4' />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LayoutWithDrawer(props: LayoutProps) {
  const router = useRouter()

  const { supabase } = useSupabase()

  async function logout(event: FormEvent) {
    event.preventDefault()
    await supabase.auth.signOut()
    router.replace('/')
  }

  const isSuperuser =
    props.superusers?.some((superuser) => superuser.user_id === props.session?.user?.id) ?? false

  return (
    <div className='flex h-screen space-x-4'>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className='sm:hidden'>
            <span className='sr-only'>Открыть меню</span>
            <MenuIcon className='h-6 w-6' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left'>
          <DrawerContent isSuperuser={isSuperuser} />
        </SheetContent>
      </Sheet>

      <div className='hidden w-64 overflow-y-auto border-r pb-12 sm:block'>
        <DrawerContent isSuperuser={isSuperuser} />
      </div>

      <main className='flex w-0 flex-1 flex-col p-2'>{props.children}</main>
    </div>
  )
}
