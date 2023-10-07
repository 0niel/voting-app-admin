'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Unlock } from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/lib/supabase/supabase-provider'

import Messages from './Message'

const formSchema = z.object({
  email: z.string().email({
    message: 'Неверный формат почты',
  }),
  password: z.string().min(6, {
    message: 'Пароль должен состоять минимум из 6 символов',
  }),
})

export const LoginForm = () => {
  const { supabase } = useSupabase()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginOAuth2 = async () => {
    supabase.auth.signInWithOAuth({
      // @ts-ignore
      provider: 'mirea',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME}/auth/callback`,
      },
    })
  }

  return (
    <>
      <Form {...form}>
        <form
          className='flex w-full flex-1 flex-col justify-center gap-2 text-foreground'
          action={'/auth/sign-in'}
          method='post'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Email' {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input placeholder='Пароль' {...field} type='password' />
                </FormControl>
                <FormDescription>
                  Этот сайт предназначен для управления мероприятиями ОВК. Обратитесь к
                  администраторам, чтобы получить доступ
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>
            <Unlock className='mr-2 h-4 w-4' /> Войти
          </Button>
          <Messages />
        </form>
      </Form>
      <div>
        <Button variant={'outline'} type='button' onClick={loginOAuth2} className='mt-2 w-full'>
          <Image className='pr-1' src={'/assets/mirea-emblem.svg'} alt='' width={25} height={25} />
          <span> Войти через МИРЭА</span>
        </Button>
      </div>
    </>
  )
}
