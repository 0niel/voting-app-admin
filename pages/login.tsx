import { appDescription } from '@/constants/constants'
import NinjaXUnion from '@/components/NinjaXUnion'
import { FormEvent, useState } from 'react'
import { useRecoilState } from 'recoil'
import { appwrite, userState } from '@/store/global'
import { useRouter } from 'next/router'
import { User } from '@/store/types'
import { AppwriteException } from 'appwrite'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [alert, setAlert] = useState('')
  const [user, setUser] = useRecoilState(userState)
  const router = useRouter()

  async function login(event: FormEvent<EventTarget>) {
    event.preventDefault()
    try {
      await appwrite.account.createEmailSession(email, password)
      setUser(await appwrite.account.get())
      await router.push('/admin/voting')
    } catch (error: any) {
      setAlert(error.message)
    }
    console.log(email, password, alert)
  }

  return (
    <div className='hero min-h-screen'>
      <div className='hero-content flex-col lg:flex-row-reverse'>
        <div className='text-center lg:text-left'>
          <h1 className='text-5xl font-bold'>ОВК 2023!</h1>
          <p className='py-6 text-slate-500'>{appDescription}</p>
          <div className='flex justify-center lg:justify-start'>
            <NinjaXUnion />
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
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
