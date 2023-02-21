import NinjaXUnion from '@/components/NinjaXUnion'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/router'
import { toast, Toaster } from 'react-hot-toast'
import LayoutWithoutDrawer from '@/components/LayoutWithoutDrawer'
import useUser from '@/lib/useUser'
import fetchJson from '@/lib/fetchJson'
import { Account, Client, Databases } from 'appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import { useAppwrite } from '@/context/AppwriteContext'

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
  const { setClient } = useAppwrite()
  const router = useRouter()

  const { mutateUser } = useUser()

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
    <LayoutWithoutDrawer>
      <div className='hero min-h-screen'>
        <div className='hero-content flex-col lg:flex-row-reverse'>
          <div className='text-center lg:text-left'>
            <h1 className='text-5xl font-bold'>ОВК 2023!</h1>
            <p className='py-6 text-slate-500'>Для получения доступа обратитесь к организаторам.</p>
            <div className='flex justify-center lg:justify-start'>
              <NinjaXUnion withLinks />
            </div>
          </div>
          <div className='card flex-shrink-0 w-full max-w-sm shadow-md bg-base-200'>
            <div className='card-body'>
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text'>Почта</span>
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type='email'
                  placeholder='почта'
                  className='input input-bordered'
                />
              </div>
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text'>Пароль</span>
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type='password'
                  placeholder='пароль'
                  className='input input-bordered'
                />
                {/*<label className='label'>*/}
                {/*  <a href='#' className='label-text-alt link link-hover'>*/}
                {/*    Forgot password?*/}
                {/*  </a>*/}
                {/*</label>*/}
              </div>
              <div className='form-control mt-6'>
                <button
                  className={`btn btn-primary`}
                  onClick={login}
                  disabled={!email || !password || loginProgress}
                >
                  {!loginProgress ? 'Войти' : <progress className='progress w-20'></progress>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position='top-right' />
    </LayoutWithoutDrawer>
  )
}
