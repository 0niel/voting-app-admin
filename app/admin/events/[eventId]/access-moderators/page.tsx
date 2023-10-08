import { redirect } from "next/navigation"

import {
  UserToView,
  getEventAccessModerators,
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
  const [session, superusers, accessModerators, users, usersPermissions] =
    await Promise.all([
      getSession(),
      getSuperusers(),
      getEventAccessModerators(eventId),
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

  const accessModeratorsUsers = accessModerators
    ?.map((accessModerator) => {
      return users?.find((user) => user.id === accessModerator.user_id)
    })
    .filter((user) => user !== undefined) as UserToView[]

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
        data={accessModeratorsUsers ?? []}
        columns={columns}
        filterColumn="email"
      />
    </div>
  )
}
