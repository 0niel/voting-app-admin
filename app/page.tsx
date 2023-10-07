import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AdminPanelHead from '@/components/Head'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/supabase/supabase-server'

export const dynamic = 'force-dynamic'

export default async function Index() {
  const session = await getSession()

  if (session?.user) {
    return redirect('/admin')
  }

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <h1 className='text-5xl font-bold'>ОВК 2023!</h1>
      <p className='text-base-content py-6'>
        Админ-панель отчётно-выборных конференций студенческого союза РТУ МИРЭА
      </p>
      {!session && (
        <Link href='/login' className='btn-primary btn'>
          <Button>Войти</Button>
        </Link>
      )}
    </div>
  )
}
