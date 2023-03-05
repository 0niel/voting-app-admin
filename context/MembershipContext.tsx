import React, { createContext, useState } from 'react'

interface MembershipContextI {
  createMembership: boolean
  setCreateMembership: Function
  membershipIDToDelete?: string
  setMembershipIDToDelete: Function
  teamIDRelatedToMembershipToDelete?: string
  setTeamIDRelatedToMembershipToDelete: Function
  postDeleteAction: () => void
  setPostDeleteAction: Function
}

const MembershipContext = createContext<MembershipContextI>({
  createMembership: false,
  setCreateMembership: (create: boolean) => null,
  membershipIDToDelete: undefined,
  setMembershipIDToDelete: (_membershipID: string) => null,
  teamIDRelatedToMembershipToDelete: undefined,
  setTeamIDRelatedToMembershipToDelete: (_membershipID: string) => null,
  postDeleteAction: () => {},
  setPostDeleteAction: (_function: () => void) => null,
})

export const useMembership = () => React.useContext(MembershipContext)

export function MembershipProvider({ children }: any) {
  const [createMembership, setCreateMembership] = useState(false)
  const [membershipIDToDelete, setMembershipIDToDelete] = useState<string | undefined>(undefined)
  const [teamIDRelatedToMembershipToDelete, setTeamIDRelatedToMembershipToDelete] = useState<
    string | undefined
  >(undefined)
  const [postDeleteAction, setPostDeleteAction] = useState<() => void>(() => {})

  return (
    <MembershipContext.Provider
      value={{
        createMembership,
        setCreateMembership,
        membershipIDToDelete,
        setMembershipIDToDelete,
        teamIDRelatedToMembershipToDelete,
        setTeamIDRelatedToMembershipToDelete,
        postDeleteAction,
        setPostDeleteAction,
      }}
    >
      {children}
    </MembershipContext.Provider>
  )
}
