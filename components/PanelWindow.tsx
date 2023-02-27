import React from 'react'

interface PanelWindowProps {
  children: React.ReactNode
  className?: string
  inCard?: boolean
}

export default function PanelWindow(props: PanelWindowProps) {
  if (props.inCard) {
    return (
      <div className={`card items-center rounded-sm text-center ${props.className}`}>
        <div className='card-body'>{props.children}</div>
      </div>
    )
  } else {
    return (
      <div className={`${props.className}`}>
        <div className='p-0.5'>{props.children}</div>
      </div>
    )
  }
}
