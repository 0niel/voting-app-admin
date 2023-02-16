import { appDescription, appName } from '@/constants/constants'
import React from 'react'
import Head from 'next/head'

export default function AdminPanelHead() {
  return (
    <Head>
      <title>{appName}</title>
      <meta name='description' content={appDescription} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta property='og:title' content={appName} />
      <meta property='og:site_name' content={appName} />
      <meta property='og:description' content={appDescription} />
      <meta
        property='og:image'
        content='https://cdn.cms.mirea.ninja/906a8074a715daf15df11317120a6666669e059e_b2104462f9.svg'
      />
      <link rel='icon' href='/favicon.ico' />
    </Head>
  )
}