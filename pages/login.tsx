import NinjaXUnion from '@/components/NinjaXUnion'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast, Toaster } from 'react-hot-toast'
import LayoutWithoutDrawer from '@/components/LayoutWithoutDrawer'
import useUser from '@/lib/useUser'
import fetchJson from '@/lib/fetchJson'
import { Account, Client } from 'appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'
import Image from 'next/image'

const alerts: { [englishAlert: string]: string } = {
  'Invalid credentials. Please check the email and password.': 'Неверные почта или пароль.',
  'Rate limit for the current endpoint has been exceeded. Please try again after some time.':
    'Превышен лимит попыток входа. Повторите попытку через некоторое время.',
  'Network request failed': 'Проверьте подключение к Интернету',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginProgress, setLoginProgress] = useState(false)
  const { client, setClient } = useAppwrite()
  const router = useRouter()

  const { mutateUser } = useUser()

  useEffect(() => {
    if (client !== undefined) {
      router.push('/admin/voting').then((r) => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(event: FormEvent<EventTarget>) {
    event.preventDefault()
    setLoginProgress(true)
    try {
      const client = new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId)
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
      await router.push('/admin/voting')
    } catch (error: any) {
      toast.error(
        alerts[error?.data?.message] ||
          alerts[error.message] ||
          error?.data?.message ||
          error.message,
      )
    }
    setLoginProgress(false)
  }

  return (
    <>
      <LayoutWithoutDrawer>
        <div className='flex min-h-full'>
          <div className='flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
            <div className='mx-auto w-full max-w-sm lg:w-96'>
              <div>
                <NinjaXUnion withLinks />
                <h2 className='mt-6 text-3xl font-bold tracking-tight text-gray-900'>
                  Вход в систему
                </h2>
                <p className='mt-2 text-sm text-gray-600'>
                  Для получения доступа обратитесь к организаторам.
                </p>
              </div>

              <div className='mt-8'>
                <div className='mt-6'>
                  <form action='#' method='POST' className='space-y-6'>
                    <div>
                      <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
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
                          className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                        />
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
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
                          className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type='submit'
                        onClick={login}
                        disabled={!email || !password || loginProgress}
                        className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50'
                      >
                        {loginProgress ? (
                          <div className='flex items-center justify-center'>
                            <svg
                              className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
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
                                stroke-width='4'
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

        <Toaster position='top-right' />
      </LayoutWithoutDrawer>
    </>
  )
}
