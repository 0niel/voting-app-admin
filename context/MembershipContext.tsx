import React, { createContext, useState } from 'react'

interface MembershipContextI {
  membershipIDToDelete?: string
  setMembershipIDToDelete: Function
  teamIDRelatedToMembershipToDelete?: string
  setTeamIDRelatedToMembershipToDelete: Function
}

const MembershipContext = createContext<MembershipContextI>({
  membershipIDToDelete: undefined,
  setMembershipIDToDelete: (_eventId: string) => null,
  teamIDRelatedToMembershipToDelete: undefined,
  setTeamIDRelatedToMembershipToDelete: (_eventId: string) => null,
})

export const useMembership = () => React.useContext(MembershipContext)

export function MembershipProvider({ children }: any) {
  const [membershipIDToDelete, setMembershipIDToDelete] = useState<string | undefined>(undefined)
  const [teamIDRelatedToMembershipToDelete, setTeamIDRelatedToMembershipToDelete] = useState<
    string | undefined
  >(undefined)

  return (
    <MembershipContext.Provider
      value={{
        membershipIDToDelete,
        setMembershipIDToDelete,
        teamIDRelatedToMembershipToDelete,
        setTeamIDRelatedToMembershipToDelete,
      }}
    >
      {children}
    </MembershipContext.Provider>
  )
}
