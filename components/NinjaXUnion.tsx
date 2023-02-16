import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/20/solid'
import React from 'react'

export default function NinjaXUnion() {
  return (
    <div className='flex inline-block items-center'>
      <Image
        src='/mirea-ninja-logo.svg'
        alt='Логотип Mirea Ninja'
        width={45}
        height={45}
        className='w-30 h-30'
      />
      <XMarkIcon className='px-1 h-7 w-7 text-slate-500' />
      <Image
        src='/student-union-logo.png'
        alt='Логотип студенческого союза РТУ МИРЭА'
        width={55}
        height={55}
        className='w-30 h-30 pr-2'
      />
    </div>
  )
}