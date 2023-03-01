import { appDescription } from '@/constants/constants'
import Link from 'next/link'
import AdminPanelHead from '@/components/Head'
import useUser from '@/lib/useUser'
import { useAppwrite } from '@/context/AppwriteContext'

export default function Landing() {
  const { user } = useUser()
  const { client } = useAppwrite()

  return (
    <main>
      <AdminPanelHead />
      <div className='hero min-h-screen'>
        <div className='hero-content text-center'>
          <div className='max-w-md'>
            <h1 className='text-5xl font-bold'>ОВК 2023!</h1>
            <p className='py-6 text-base-content'>{appDescription}</p>
            <Link href={client && user ? '/admin/dashboard' : '/login'} className='btn-primary btn'>
              Войти {user?.userData && client && `как ${user.userData.name}`}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
