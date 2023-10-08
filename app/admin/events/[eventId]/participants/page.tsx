import { redirect } from "next/navigation"

import {
  getEventParticipants,
  getSession,
  getSuperusers,
  getUsers,
  getUsersPermissions,
  isUserAccessModerator,
  isUserHasAllPermissions,
} from "@/lib/supabase/supabase-server"
import { DataTable } from "@/components/table/DataTable"

import CreateParticipantDialogButton from "./DialogCreate"
import { columns } from "./columns"

export default async function Participants({
  params: { eventId },
}: {
  params: { eventId: number }
}) {
  const [session, participants, users] = await Promise.all([
    getSession(),
    getEventParticipants(eventId),
    getUsers(),
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
        <h2 className="text-2xl font-bold tracking-tight">Список участников</h2>
        <p className="text-muted-foreground">
          Список всех участников зарегистрированных на меропритие. Участники
          могут принимать участние в голосованиях
        </p>
      </div>
      <CreateParticipantDialogButton users={users ?? []} eventId={eventId} />
      <DataTable
        data={participants ?? []}
        columns={columns}
        filterColumn="full_name"
      />
    </div>
  )
}
