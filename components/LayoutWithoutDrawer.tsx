import AdminPanelHead from '@/components/Head'
import { LayoutProps } from '@/components/LayoutWithDrawer'
import { Toaster } from 'react-hot-toast'

export default function LayoutWithoutDrawer(props: LayoutProps) {
  return (
    <>
      <AdminPanelHead />
      <main className='h-screen bg-white'>
        {props.children}
        <Toaster position='bottom-right' />
      </main>
    </>
  )
}
