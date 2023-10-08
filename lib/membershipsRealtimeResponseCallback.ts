import React, { Dispatch, SetStateAction } from "react"
import { Models, RealtimeResponseEvent } from "appwrite"

import { EventDocument } from "@/lib/models/EventDocument"

export function membershipsRealtimeResponseCallback(
  response: RealtimeResponseEvent<unknown>,
  setMemberships: Dispatch<SetStateAction<Models.Membership[]>>,
  teamID: string
) {
  const payloadMembership = response.payload as Models.Membership
  if (response.events.includes(`teams.${teamID}.memberships.*.create`)) {
    setMemberships((memberships) => {
      console.log(
        memberships.some(
          (membership) => membership.$id == payloadMembership.$id
        )
      )
      if (
        !memberships.some(
          (membership) => membership.$id == payloadMembership.$id
        )
      ) {
        console.log("create event")
        return [payloadMembership, ...memberships]
      } else {
        return memberships
      }
    })
  } else if (response.events.includes(`teams.${teamID}.memberships.*.delete`)) {
    console.log("delete event")
    setMemberships((memberships) =>
      memberships.filter(
        (membership) => membership.$id !== payloadMembership.$id
      )
    )
  }
}
