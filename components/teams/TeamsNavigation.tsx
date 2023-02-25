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
    <div
      className={`${props.className} btn-group btn-group-vertical md:btn-group-horizontal w-screen-3/4 justify-center`}
    >
      {props.buttons.map((button, index) => (
        <Link
          href={button.path}
          key={index}
          className={`btn ${router.pathname.includes(button.keyword) && 'btn-active'}`}
        >
          {button.name}
        </Link>
      ))}
    </div>
  )
}
