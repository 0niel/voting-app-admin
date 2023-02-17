import { Account, Client, Databases } from 'appwrite'
import { appwriteEndpoint, appwriteProjectId } from '@/constants/constants'
import { atom } from 'recoil'
import { User } from '@/store/types'

export const client = new Client().setEndpoint(appwriteEndpoint).setProject(appwriteProjectId)
const account = new Account(client)
const databases = new Databases(client)
export const appwrite = { account, databases }

export const userState = atom<User | null>({
  key: 'user',
  default: null,
})
