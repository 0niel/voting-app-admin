import { redirect } from "next/navigation"

import {
  getEvents,
  getSession,
  isUserAccessModerator,
  isUserHasAllPermissions,
  isUserVotingModerator,
} from "@/lib/supabase/supabase-server"
import { DataTable } from "@/components/table/DataTable"

import CreateEventDialogButton from "./DialogCreate"
import { columns } from "./columns"

export default async function Events() {
  const [session, events] = await Promise.all([getSession(), getEvents()])

  const user = session?.user

  if (!user) {
    return redirect("/404")
  }

  if (
    !isUserHasAllPermissions(user.id) &&
    !isUserVotingModerator(user.id) &&
    !isUserAccessModerator(user.id)
  ) {
    return redirect("/404")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Список меоприятий</h2>
        <p className="text-muted-foreground">
          Список всех мероприятий, созданных в системе. Меропрития — это
          события, в рамках которых проводятся голосования
        </p>
      </div>
      <CreateEventDialogButton />
      <DataTable data={events ?? []} columns={columns} filterColumn="name" />
    </div>
  )
}
