import { appName } from '@/constants/constants'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className='navbar fixed top-0 left-0 right-0 backdrop-filter backdrop-blur-sm bg-opacity-30 border-b border-base-200'>
      <div className='navbar-start'>
        <Link href='/' className='btn btn-ghost normal-case content-center text-xl'>
          {appName}
        </Link>
      </div>
      <div className='navbar-center'></div>
      <div className='navbar-end'></div>
    </nav>
  )
}
