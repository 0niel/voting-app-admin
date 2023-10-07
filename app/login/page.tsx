import Image from 'next/image'
import { redirect } from 'next/navigation'

import NinjaXUnion from '@/components/NinjaXUnion'
import { getSession } from '@/lib/supabase/supabase-server'
import { LoginForm } from './LoginForm'

export default async function Login() {
  const session = await getSession()

  if (session) {
    return redirect('/admin')
  }

  return (
    <div className='flex min-h-full'>
      <div className='flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
        <div className='mx-auto w-full max-w-sm lg:w-96'>
          <div>
            <NinjaXUnion withLinks />
            <h2 className='text-neutral-focus mt-6 text-3xl font-bold tracking-tight'>
              Вход в систему
            </h2>
            <p className='text-neutral mt-2 text-sm'>
              Для получения доступа обратитесь к организаторам.
            </p>
          </div>

          <div className='mt-8'>
            <div className='mt-6'>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
      <div className='relative hidden w-0 flex-1 lg:block'>
        <Image
          className='absolute inset-0 h-full w-full object-cover'
          fill
          src='https://www.mirea.ru/upload/medialibrary/1b3/01.jpg'
          alt=''
        />
      </div>
    </div>
  )
}
