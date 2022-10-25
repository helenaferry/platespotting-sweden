import '../styles/tailwind.css'
import type { AppProps } from 'next/app'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import React, { useState } from 'react';
import { Provider } from 'react-redux'
import store from './../store/store'

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session,
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (

    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </SessionContextProvider>

  )
}

export default MyApp