import React, { createContext, useEffect, useState } from 'react'
import { Account, Databases, Models } from 'appwrite'

interface AppwriteContextI {
  account?: Account
  databases?: Databases
  setUser: Function
}

const AppwriteContext = createContext<AppwriteContextI>({
  account: undefined,
  databases: undefined,
  setUser: (_appwrite: Models.Session, _databases: Databases) => null,
})

export const useAppwrite = () => React.useContext(AppwriteContext)

export function AppwriteProvider({ children }: any) {
  const [account, setAccount] = useState<Account | undefined>(undefined)
  const [databases, setDatabases] = useState<Databases | undefined>(undefined)

  const setUser = async (_account: Account, _databases: Databases) => {
    setAccount(_account)
    setDatabases(_databases)
  }

  return (
    <AppwriteContext.Provider value={{ account, databases, setUser }}>
      {children}
    </AppwriteContext.Provider>
  )
}
