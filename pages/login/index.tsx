import LayoutWithoutDrawer from '@/components/LayoutWithoutDrawer'
import { appDescription } from '@/constants/constants'
import NinjaXUnion from '@/components/NinjaXUnion'

export default function Login() {
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
                <span className='label-text'>Login</span>
              </label>
              <input type='text' placeholder='login' className='input input-bordered' />
            </div>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Password</span>
              </label>
              <input type='text' placeholder='password' className='input input-bordered' />
              {/*<label className='label'>*/}
              {/*  <a href='#' className='label-text-alt link link-hover'>*/}
              {/*    Forgot password?*/}
              {/*  </a>*/}
              {/*</label>*/}
            </div>
            <div className='form-control mt-6'>
              <button className='btn btn-primary'>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
