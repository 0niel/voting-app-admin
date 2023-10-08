import { redirect } from "next/navigation"

import {
  UserToView,
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
  isUserAccessModerator,
  isUserHasAllPermissions,
  isUserVotingModerator,
} from "@/lib/supabase/supabase-server"
import { DataTable } from "@/components/table/DataTable"

import CreateVotingModeratorDialogButton from "./DialogCreate"
import { columns } from "./columns"

export default async function VotingModerators({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, users] = await Promise.all([getSession(), getUsers()])

  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (
    !isUserHasAllPermissions(user.id) &&
    !isUserVotingModerator(user.id) &&
    !isUserAccessModerator(user.id)
  ) {
    return redirect("/")
  }

  const votingModerators = users
    ?.map((realUser) => {
      return users?.find((user) => user.id === realUser.id)
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
        data={votingModerators ?? []}
        columns={columns}
        filterColumn="full_name"
      />
    </div>
  )
}
