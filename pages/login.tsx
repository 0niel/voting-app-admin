import { Account } from 'appwrite'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import LayoutWithoutDrawer from '@/components/LayoutWithoutDrawer'
import NinjaXUnion from '@/components/NinjaXUnion'
import { useAppwrite } from '@/context/AppwriteContext'
import { mapAppwriteErroToMessage } from '@/lib/errorMessages'
import fetchJson from '@/lib/fetchJson'
import useUser from '@/lib/useUser'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginProgress, setLoginProgress] = useState(false)
  const { client, setClient } = useAppwrite()
  const router = useRouter()

  const { mutateUser } = useUser()

  useEffect(() => {
    if (client !== undefined) {
      router.push('/admin/dashboard').then((r) => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(event: FormEvent<EventTarget>) {
    event.preventDefault()
    setLoginProgress(true)
    try {
      const account = new Account(client)
      await account.createEmailSession(email, password)
      const userData = await account.get()
      setClient(client)
      await mutateUser(
        await fetchJson('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userData }),
        }),
        false,
      )
      await router.push('/admin/dashboard')
    } catch (error: any) {
      toast.error(mapAppwriteErroToMessage(error.message))
    }
    setLoginProgress(false)
  }

  async function loginOAuth2(event: FormEvent<EventTarget>) {
    event.preventDefault()
    new Account(client).createOAuth2Session(
      'mirea',
      `${process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME}/oauth2`,
      `${process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME}/login`,
    )
  }

  return (
    <>
      <LayoutWithoutDrawer>
        <div className='flex min-h-full'>
          <div className='flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
            <div className='mx-auto w-full max-w-sm lg:w-96'>
              <div>
                <NinjaXUnion withLinks />
                <h2 className='mt-6 text-3xl font-bold tracking-tight text-neutral-focus'>
                  Вход в систему
                </h2>
                <p className='mt-2 text-sm text-neutral'>
                  Для получения доступа обратитесь к организаторам.
                </p>
              </div>

              <div className='mt-8'>
                <div className='mt-6'>
                  <form action='#' method='POST' className='space-y-6'>
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-base-content'
                      >
                        Email адрес
                      </label>
                      <div className='mt-1'>
                        <input
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          id='email'
                          name='email'
                          type='email'
                          autoComplete='email'
                          required
                          className='block w-full appearance-none rounded-md border border-base-200 px-3 py-2 placeholder-base-300 shadow-sm focus:border-primary focus:outline-none focus:ring-primary-focus sm:text-sm'
                        />
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <label htmlFor='password' className='block text-sm font-medium text-neutral'>
                        Пароль
                      </label>
                      <div className='mt-1'>
                        <input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          id='password'
                          name='password'
                          type='password'
                          autoComplete='current-password'
                          required
                          className='block w-full appearance-none rounded-md border border-base-200 px-3 py-2 placeholder-base-300 shadow-sm focus:border-primary focus:outline-none focus:ring-primary-focus sm:text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type='submit'
                        onClick={login}
                        disabled={!email || !password || loginProgress}
                        className='flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-base-100 text-primary-content shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50'
                      >
                        {loginProgress ? (
                          <div className='flex items-center justify-center'>
                            <svg
                              className='-ml-1 mr-3 h-5 w-5 animate-spin'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                            >
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                              ></circle>
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8v8z'
                              ></path>
                            </svg>
                            Загрузка
                          </div>
                        ) : (
                          'Войти'
                        )}
                      </button>
                    </div>
                    <div>
                      <button
                        className='flex w-full items-center justify-center rounded-md border-2 border-base-200 py-2 px-4 text-sm font-medium shadow-sm ring-base-200 hover:border-base-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50'
                        onClick={loginOAuth2}
                      >
                        <Image
                          className='pr-1'
                          src={'/assets/mirea-emblem.svg'}
                          alt=''
                          width={25}
                          height={25}
                        />
                        <span> Войти через ЛКС</span>
                      </button>
                    </div>
                  </form>
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
      </LayoutWithoutDrawer>
    </>
  )
}
