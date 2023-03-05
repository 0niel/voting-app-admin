import { Toaster } from 'react-hot-toast'

import AdminPanelHead from '@/components/Head'
import { LayoutProps } from '@/components/LayoutWithDrawer'

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
