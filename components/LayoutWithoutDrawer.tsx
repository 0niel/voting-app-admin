import AdminPanelHead from '@/components/Head'
import { LayoutProps } from '@/components/LayoutWithDrawer'

export default function LayoutWithoutDrawer(props: LayoutProps) {
  return (
    <>
      <AdminPanelHead />
      <main>{props.children}</main>
    </>
  )
}
