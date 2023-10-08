import { getSession, getSuperusers } from "@/lib/supabase/supabase-server"
import LayoutWithDrawer from "@/components/LayoutWithDrawer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, superusers] = await Promise.all([
    getSession(),
    getSuperusers(),
  ])

  return (
    <LayoutWithDrawer session={session} superusers={superusers}>
      {children}
    </LayoutWithDrawer>
  )
}
