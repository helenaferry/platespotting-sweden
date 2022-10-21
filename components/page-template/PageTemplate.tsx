import React, { ReactNode } from 'react'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'

type Props = {
    children: ReactNode
}

export default function PageTemplate(props: Props) {
    const session = useSession()
    const supabase = useSupabaseClient()

    async function signOut() {
        const { error } = await supabase.auth.signOut()
    }

    return <div className="w-screen min-h-full bg-slate-100"><div className="mx-auto h-screen bg-white p-5" style={{ maxWidth: "720px" }}>
        <Head>
            <title>Platespotting Sweden</title>
            <meta name="description" content="Platespotting Sweden" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <header className="relative text-center">
            {session && <a onClick={signOut} className="link absolute right-0">
                Logga ut {session?.user.email}
            </a>}
            <h1 className="pt-10 text-2xl">
                Platespotting Sverige
            </h1>
            {session &&
                <nav className="m-3">
                    <Link href="/">
                        <a className="link p-2 border-r-2">Startsida</a>
                    </Link>
                    <Link href="/list">
                        <a className="link p-2 border-r-2">Lista alla</a>
                    </Link>
                    <Link href="/map">
                        <a className="link p-2 border-r-2">Visa på karta</a>
                    </Link>
                    <Link href="/add">
                        <a className="link p-2">Lägg till</a>
                    </Link>
                </nav>
            }
        </header>
        <main className="flex justify-center">
            {!session ? (
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="light"
                />
            ) : (
                <div className="w-11/12">{props.children}</div>
            )}
        </main>
    </div></div>
}