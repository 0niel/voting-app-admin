import React, { createContext, useState } from 'react'

interface ResourceContextI {
  createResource: boolean
  setCreateResource: Function
  resourceIdToUpdate?: string
  setResourceIdToUpdate: Function
  resourceIdToDelete?: string
  setResourceIdToDelete: Function
}

const ResourceContext = createContext<ResourceContextI>({
  createResource: false,
  setCreateResource: (_open: boolean) => null,
  resourceIdToUpdate: undefined,
  setResourceIdToUpdate: (_eventId: string) => null,
  resourceIdToDelete: undefined,
  setResourceIdToDelete: (_eventId: string) => null,
})

export const useResource = () => React.useContext(ResourceContext)

export function ResourceProvider({ children }: any) {
  const [createResource, setCreateResource] = useState<boolean>(false)
  const [resourceIdToUpdate, setResourceIdToUpdate] = useState<string | undefined>(undefined)
  const [resourceIdToDelete, setResourceIdToDelete] = useState<string | undefined>(undefined)

  return (
    <ResourceContext.Provider
      value={{
        createResource: createResource,
        setCreateResource: setCreateResource,
        resourceIdToUpdate: resourceIdToUpdate,
        setResourceIdToUpdate: setResourceIdToUpdate,
        resourceIdToDelete: resourceIdToDelete,
        setResourceIdToDelete: setResourceIdToDelete,
      }}
    >
      {children}
    </ResourceContext.Provider>
  )
}
