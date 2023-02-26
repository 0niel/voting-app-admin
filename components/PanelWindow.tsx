import React from 'react'

interface PanelWindowProps {
  children: React.ReactNode
  className?: string
  inCard?: boolean
}

export default function PanelWindow(props: PanelWindowProps) {
  if (props.inCard) {
    return (
      <div
        className={`card items-center rounded-sm text-center ring-1 ring-base-200 hover:ring-2 ${props.className}`}
      >
        <div className='card-body'>{props.children}</div>
      </div>
    )
  } else {
    return (
      <div className={`rounded-sm ring-1 ring-base-200 hover:ring-2 ${props.className}`}>
        <div className='p-0.5'>{props.children}</div>
      </div>
    )
  }
}
