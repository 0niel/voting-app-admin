import React from "react"
import { useMembership } from "@/context/MembershipContext"
import { TrashIcon } from "@heroicons/react/24/outline"
import { Models } from "appwrite"

import { formatDate } from "@/lib/formatDate"
import { mapRoles } from "@/lib/mapRoles"
import { Cell, Column } from "@/components/Table"

export const membershipColumns: Column[] = [
  { title: "id" },
  { title: "Имя" },
  { title: "Почта" },
  { title: "Роли" },
  { title: "Приглашен" },
  { title: "" },
]

export function GetMembershipRows(
  memberships: Models.Membership[],
  isPermitted: boolean
): Cell[][] {
  const { setMembershipIDToDelete } = useMembership()
  return memberships.map((membership) => {
    return [
      { value: membership.$id },
      { value: membership.userName },
      { value: membership.userEmail },
      { value: membership.roles.map((role) => mapRoles(role)).join(", ") },
      { value: formatDate(membership.invited) },
      {
        value:
          !membership.roles.includes("owner") && isPermitted ? (
            <button
              className="btn-outline btn-secondary btn"
              onClick={() => setMembershipIDToDelete(membership.$id)}
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          ) : (
            <div />
          ),
      },
    ]
  })
}
