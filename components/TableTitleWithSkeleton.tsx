import React from 'react'

interface TableTitleWithSkeletonProps {
  title: string
  isLoading: boolean
  skeletonSize: 64 | 96
}

export default function TableTitleWithSkeleton(props: TableTitleWithSkeletonProps) {
  if (!props.isLoading) {
    return <div>{props.title}</div>
  }
  return (
    <div className='max-w-sm animate-pulse'>
      <div className={`mt-2 h-5 w-${props.skeletonSize} rounded-full bg-gray-200`} />
    </div>
  )
}
