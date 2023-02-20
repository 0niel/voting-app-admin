import { appwrite } from '@/store/global'

export async function getJWT(): Promise<any> {
  const jwt = window?.localStorage.getItem('jwt')
  const jwtExpires = +(window?.localStorage.getItem('jwt_expires') || 0)
  if (jwt && jwtExpires > Date.now()) {
    return jwt
  } else {
    try {
      setJWT((await appwrite.account.createJWT()).jwt)
      return await getJWT()
    } catch (error) {
      return null
    }
  }
}

export const setJWT = (jwt: string) => {
  const jwtExpires = Date.now() + 3153600
  window?.localStorage.setItem('jwt', jwt)
  window?.localStorage.setItem('jwt_expires', jwtExpires.toString())
}