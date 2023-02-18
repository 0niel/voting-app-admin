import { useRecoilState } from 'recoil'
import { userState } from '@/store/global'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
}
export default function RouteGuard(props: RouteGuardProps) {
  const [user, setUser] = useRecoilState(userState)
  const router = useRouter()

  useEffect(() => {
    const pushLogin = async () => {
      await router.push('/login')
    }
    if (user == null) {
      pushLogin().catch(console.error)
    }
  }, [])

  return <>{props.children}</>
}
