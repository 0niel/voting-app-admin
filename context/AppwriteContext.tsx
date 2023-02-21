import React, { createContext, useState } from 'react'
import { Client, Databases, Models } from 'appwrite'

interface AppwriteContextI {
  client?: Client
  setClient: Function
}

const AppwriteContext = createContext<AppwriteContextI>({
  client: undefined,
  setClient: (_appwrite: Models.Session, _databases: Databases) => null,
})

export const useAppwrite = () => React.useContext(AppwriteContext)

export function AppwriteProvider({ children }: any) {
  const [client, setClient] = useState<Client | undefined>(undefined)

  return (
    <AppwriteContext.Provider value={{ client, setClient }}>{children}</AppwriteContext.Provider>
  )
}
