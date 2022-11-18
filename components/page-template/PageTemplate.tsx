import React, { ReactNode, useEffect } from 'react'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAppSelector, useAppDispatch } from './../../hooks'
import { fetchSpottings } from './../../store/spottingsSlice'
import { fetchTeamMembers } from './../../store/teamMemberSlice'
import { fetchSettings } from './../../store/settingsSlice';
import Head from 'next/head'
import Link from 'next/link'
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';

type Props = {
    children: ReactNode
}

export default function PageTemplate(props: Props) {
    const session = useSession()
    const supabase = useSupabaseClient()
    const error = useAppSelector(state => state.spottings.error)
    const status = useAppSelector(state => state.spottings.status)
    const teamMemberStatus = useAppSelector(state => state.teamMembers.status)
    //  const settingsStatus = useAppSelector(state => state.settings.status)
    const name = useAppSelector(state => state.settings.name)
    const dispatch = useAppDispatch()

    if (status === 'idle') {
        dispatch(fetchSpottings())
    }

    if (teamMemberStatus === 'idle') {
        dispatch(fetchTeamMembers())
    }

    useEffect(() => {
        dispatch(fetchSettings({ id: session?.user.id, database: supabase }))
    }, [session])

    /* supabase
         .channel('*')
         .on('postgres_changes', { event: '*', schema: '*' }, payload => {
             console.log('postgrs_changes ' + payload.eventType + ' ' + payload.table, payload.new);
             if (payload.table === 'spottings' && payload.eventType === 'INSERT') {
                 dispatch(addSpotting(payload.new))
             }
         })
         .subscribe()*/

    /* supabase
     .channel('*')
     .on('postgres_changes', { event: '*', schema: '*' }, payload => {
         console.log('postgrs_changes ' + payload.eventType + ' ' + payload.table, payload.new);
         if (payload.table === 'spottingTeamMembers' && payload.eventType === 'INSERT') {
             console.log('team member added', payload.new);
             console.log(dispatch(findTeamMember(payload.new.id)))
         }
     })
     .subscribe()*/

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        location.reload()
    }

    return <div className="w-screen min-h-full bg-slate-100"><div className="p-2 mx-auto min-h-screen bg-white" style={{ maxWidth: "1024px" }}>
        <Head>
            <title>Platespotting Sweden</title>
            <meta name="description" content="Platespotting Sweden" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <header className="relative text-center">
            <div className="absolute left-0 text-left">
                <ButtonGroup variant="text" aria-label="text button group">
                    <Button><Link href="/"><HomeIcon /></Link></Button>
                </ButtonGroup>
            </div>
            <div className="absolute right-0 text-right">
                {session &&
                    <ButtonGroup variant="text" aria-label="text button group">
                        <Button onClick={signOut}>Logga ut {name ? name : session?.user.email}
                        </Button>
                        <Button><Link href="/settings"><SettingsIcon /></Link></Button>
                    </ButtonGroup>
                }

            </div>
            <Typography variant="h1" gutterBottom>
                <Link href="/">Platespotting Sweden</Link>
            </Typography>
            {error && <p>Fel: {error}</p>}
            {session &&
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        '& > *': {
                            m: 1,
                        },
                    }}
                >
                    <ButtonGroup variant="text" aria-label="text button group">
                        <Button><Link href="/list">Lista alla</Link></Button>
                        <Button><Link href="/map">Karta</Link></Button>
                        <Button><Link href="/add">Lägg till</Link></Button>
                    </ButtonGroup>
                </Box>
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
                <div className="w-11/12">
                    {props.children}
                </div>
            )}
        </main>
    </div></div>
}