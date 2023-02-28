import React, { createContext, useState } from 'react'
import { Account, Client, Databases, Models } from 'appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'

interface AppwriteContextI {
  client: Client
  setClient: Function
}

const AppwriteContext = createContext<AppwriteContextI>({
  client: new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId),
  setClient: (_appwrite: Models.Session, _databases: Databases) => null,
})

export const useAppwrite = () => React.useContext(AppwriteContext)

export function AppwriteProvider({ children }: any) {
  const [client, setClient] = useState<Client>(
    new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId),
  )

  return (
    <AppwriteContext.Provider value={{ client, setClient }}>{children}</AppwriteContext.Provider>
  )
}
