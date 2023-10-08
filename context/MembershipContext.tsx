import React, { createContext, useState } from "react"

interface MembershipContextI {
  createMembership: boolean
  setCreateMembership: Function
  membershipIDToDelete?: string
  setMembershipIDToDelete: Function
}

const MembershipContext = createContext<MembershipContextI>({
  createMembership: false,
  setCreateMembership: (create: boolean) => null,
  membershipIDToDelete: undefined,
  setMembershipIDToDelete: (_membershipID: string) => null,
})

export const useMembership = () => React.useContext(MembershipContext)

export function MembershipProvider({ children }: any) {
  const [createMembership, setCreateMembership] = useState(false)
  const [membershipIDToDelete, setMembershipIDToDelete] = useState<
    string | undefined
  >(undefined)

  return (
    <MembershipContext.Provider
      value={{
        createMembership,
        setCreateMembership,
        membershipIDToDelete,
        setMembershipIDToDelete,
      }}
    >
      {children}
    </MembershipContext.Provider>
  )
}
