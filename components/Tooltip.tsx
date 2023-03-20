import React from 'react'

interface TooltipProps {
  text: string
  children: React.ReactElement
}

export default function Tooltip(props: TooltipProps) {
  return (
    <div className='tooltip tooltip-secondary' data-tip={props.text}>
      {props.children}
    </div>
  )
}
