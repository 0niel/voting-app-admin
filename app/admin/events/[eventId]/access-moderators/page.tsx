import { redirect } from "next/navigation"

import {
  UserToView,
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
} from "@/lib/supabase/supabase-server"
import { DataTable } from "@/components/table/DataTable"

import CreateAccessModeratorDialogButton from "./DialogCreate"
import { columns } from "./columns"

export default async function AccessModerators({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, superusers, users, usersPermissions] = await Promise.all([
    getSession(),
    getSuperusers(),
    getUsers(),
    getUsersPermissions(),
  ])

  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  const isUserHasAllPermissions = () => {
    return superusers?.some((superuser) => superuser.user_id === user?.id)
  }

  const isUserVotingModerator = () => {
    return usersPermissions?.some(
      (permission) =>
        permission.user_id === user?.id && permission.is_voting_moderator
    )
  }

  const isUserAccessModerator = () => {
    return usersPermissions?.some(
      (permission) =>
        permission.user_id === user?.id && permission.is_access_moderator
    )
  }

  if (!isUserHasAllPermissions()) {
    return redirect("/")
  }

  const accessModerators = [
    {
      user_id: "4fdfa192-44d1-4cf3-ab98-2528ca1ef1ce",
      full_name: "Тест тест тет",
      email: "mock@mirea.ru",
      created_at: "2023-10-07 19:42:43.633949+00",
    },
  ]

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
