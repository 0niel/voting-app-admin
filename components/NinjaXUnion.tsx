import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/20/solid'
import React from 'react'
import Link from 'next/link'
import { mireaNinjaURL, studentUnionURL } from '@/constants/constants'

interface NinjaXUnionProps {
  withLinks?: boolean
}
const mireaNinjaImage = (
  <Image
    src='/assets/mirea-ninja-logo.svg'
    alt='Логотип Mirea Ninja'
    width={45}
    height={45}
    className='w-30 h-30'
  />
)
const studentUnionImage = (
  <Image
    src='/assets/student-union-logo.png'
    alt='Логотип студенческого союза РТУ МИРЭА'
    width={55}
    height={55}
    className='w-30 h-30 pr-2'
    priority
  />
)

export default function NinjaXUnion(props: NinjaXUnionProps) {
  return (
    <div className='flex inline-block items-center'>
      {props.withLinks ? (
        <Link target='_blank' href={mireaNinjaURL}>
          {mireaNinjaImage}
        </Link>
      ) : (
        mireaNinjaImage
      )}
      <XMarkIcon className='px-1 h-7 w-7 text-slate-500' />
      {props.withLinks ? (
        <Link target='_blank' href={studentUnionURL}>
          {studentUnionImage}
        </Link>
      ) : (
        studentUnionImage
      )}
    </div>
  )
}
