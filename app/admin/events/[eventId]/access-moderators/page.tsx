import { redirect } from "next/navigation"

import {
  getSession,
  getUsers,
  getUsersPermissions,
  isUserAccessModerator,
  isUserHasAllPermissions,
} from "@/lib/supabase/supabase-server"
import { DataTable } from "@/components/table/DataTable"

import CreateAccessModeratorDialogButton from "./DialogCreate"
import { columns } from "./columns"

export default async function AccessModerators({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, users, permissions] = await Promise.all([
    getSession(),
    getUsers(),
    getUsersPermissions(),
  ])

  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!isUserHasAllPermissions(user.id) && !isUserAccessModerator(user.id)) {
    return redirect("/")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Список модераторов доступа
        </h2>
        <p className="text-muted-foreground">
          Список всех модераторов доступа мероприятия. Модераторы доступа могут
          приглашать новых участников в мероприятие.
        </p>
      </div>
      <CreateAccessModeratorDialogButton
        users={users ?? []}
        eventId={eventId}
      />
      <DataTable
        data={accessModerators ?? []}
        columns={columns}
        filterColumn="full_name"
      />
    </div>
  )
}
