import NinjaXUnion from '@/components/NinjaXUnion'
import { FormEvent, useEffect, useState } from "react";
import { useRecoilState } from 'recoil'
import { appwrite, userState } from '@/store/global'
import { useRouter } from 'next/router'
import { toast, Toaster } from 'react-hot-toast'
import LayoutWithoutDrawer from '@/components/LayoutWithoutDrawer'

const alerts: { [englishAlert: string]: string } = {
  'Invalid credentials. Please check the email and password.': 'Неверные почта или пароль.',
  'Rate limit for the current endpoint has been exceeded. Please try again after some time.':
    'Превышен лимит попыток входа. Повторите попытку через некоторое время.',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useRecoilState(userState)
  const router = useRouter()

  useEffect(() => {
    const pushVoting = async () => {
      await router.push('/admin/voting')
    }
    if (user != null) {
      pushVoting().catch(console.error)
    }
  }, [])

  async function login(event: FormEvent<EventTarget>) {
    event.preventDefault()
    try {
      await appwrite.account.createEmailSession(email, password)
      setUser(await appwrite.account.get())
      await router.push('/admin/voting')
    } catch (error: any) {
      toast.error(alerts[error.message] || error.message)
    }
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
                <button className='btn btn-primary' onClick={login} disabled={!email || !password}>
                  Войти
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
