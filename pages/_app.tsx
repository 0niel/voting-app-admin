import '@/styles/globals.css'

import ru from 'date-fns/locale/ru'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import type { ReactElement, ReactNode } from 'react'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import { SWRConfig } from 'swr'

import { AppwriteProvider } from '@/context/AppwriteContext'
import { EventProvider } from '@/context/EventContext'
import { MembershipProvider } from '@/context/MembershipContext'
import { PollProvider } from '@/context/PollContext'
import { ResourceProvider } from '@/context/ResourceContext'
import fetchJson from '@/lib/fetchJson'

registerLocale('ru', ru)
setDefaultLocale('ru')

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <AppwriteProvider>
      <EventProvider>
        <MembershipProvider>
          <PollProvider>
            <ResourceProvider>
              <SWRConfig
                value={{
                  fetcher: fetchJson,
                  onError: (err) => {
                    console.error(err)
                  },
                }}
              >
                {getLayout(<Component {...pageProps} />)}
              </SWRConfig>
            </ResourceProvider>
          </PollProvider>
        </MembershipProvider>
      </EventProvider>
    </AppwriteProvider>
  )
}
