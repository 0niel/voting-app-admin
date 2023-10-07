import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import MNLogo from '@/components/logos/MNLogo'
import SuMireaLogo from '@/components/logos/SuMireaLogo'
import { mireaNinjaURL, studentUnionURL } from '@/constants/constants'

interface NinjaXUnionProps {
  withLinks?: boolean
}

export default function NinjaXUnion(props: NinjaXUnionProps) {
  return (
    <div className='flex items-center'>
      {props.withLinks ? (
        <Link target='_blank' href={mireaNinjaURL}>
          <MNLogo className='w-100 h-100' />
        </Link>
      ) : (
        <MNLogo className='w-30 h-30' />
      )}
      <X className='text-neutral h-7 w-7 px-1 dark:text-slate-400' />
      {props.withLinks ? (
        <Link target='_blank' href={studentUnionURL}>
          <SuMireaLogo className='w-100 h-100' />
        </Link>
      ) : (
        <SuMireaLogo className='w-30 h-30' />
      )}
    </div>
  )
}
