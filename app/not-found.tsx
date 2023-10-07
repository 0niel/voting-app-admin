import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='lg:p-8'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Страница не найдена</h1>
          <p className='text-sm text-muted-foreground'>
            Возможно, такой станицы не существует или у вас нет прав, чтобы её просматривать.
          </p>
          <Link href='/'>
            <Button>Попробовать повторить</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
