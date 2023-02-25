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
        className={`ring-1 ring-secondary hover:ring-secondary-focus rounded-box card items-center text-center ${props.className}`}
      >
        <div className='card-body'>{props.children}</div>
      </div>
    )
  } else {
    return (
      <div
        className={`ring-1 ring-secondary hover:ring-secondary-focus rounded-box ${props.className}`}
      >
        <div className='p-1'>{props.children}</div>
      </div>
    )
  }
}
