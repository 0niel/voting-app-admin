import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface NavigationButtonsInterface {
  name: string
  keyword: string
  path: string
}

interface TeamNavigationProps {
  className?: string
  buttons: NavigationButtonsInterface[]
}
export default function TeamsNavigation(props: TeamNavigationProps) {
  const router = useRouter()

  return (
    <div className={`${props.className} tabs tabs-boxed justify-center`}>
      {props.buttons.map((button, index) => (
        <Link
          href={button.path}
          key={index}
          className={`tab ${router.pathname.includes(button.keyword) && 'tab-active'}`}
        >
          {button.name}
        </Link>
      ))}
    </div>
  )
}
