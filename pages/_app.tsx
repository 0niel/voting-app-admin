import '@/styles/globals.css'
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import fetchJson from '@/lib/fetchJson'
import { AppwriteProvider } from '@/context/AppwriteContext'
import { EventProvider } from '@/context/EventContext'

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
      </EventProvider>
    </AppwriteProvider>
  )
}
