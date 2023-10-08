import { redirect } from "next/navigation"

import {
  UserToView,
  getEventVotingModerators,
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
} from "@/lib/supabase/supabase-server"
import { DataTable } from "@/components/table/DataTable"

import CreateVotingModeratorDialogButton from "./DialogCreate"
import { columns } from "./columns"

export default async function VotingModerators({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, superusers, votingModerators, users, usersPermissions] =
    await Promise.all([
      getSession(),
      getSuperusers(),
      getEventVotingModerators(eventId),
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

  if (
    !isUserHasAllPermissions() &&
    !isUserVotingModerator() &&
    !isUserAccessModerator()
  ) {
    return redirect("/")
  }

  const votingModeratorsUsers = votingModerators
    ?.map((votingModerator) => {
      return users?.find((user) => user.id === votingModerator.user_id)
    })
    .filter((user) => user !== undefined) as UserToView[]

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Список модераторов голосования
        </h2>
        <p className="text-muted-foreground">
          Список всех модераторов голосования меропрития. Модераторы голосования
          могут создавать новые голосования
        </p>
      </div>
      <CreateVotingModeratorDialogButton
        users={users ?? []}
        eventId={eventId}
      />
      <DataTable
        data={votingModeratorsUsers ?? []}
        columns={columns}
        filterColumn="email"
      />
    </div>
  )
}
