import type { NextPage } from 'next'
import React, { useState, useEffect, useRef } from 'react';
import PageTemplate from "./../components/page-template/PageTemplate"
import MemberBadge from './../components/member-badge/MemberBadge'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAppSelector, useAppDispatch } from './../hooks'
import { selectAllTeamMembers, addNewTeamMember } from './../store/teamMemberSlice'
import { setHasTeamMembers, setName } from '../store/settingsSlice';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

const Settings: NextPage = () => {
    const supabase = useSupabaseClient()
    const session = useSession()
    const dispatch = useAppDispatch()
    const hasTeamMembers = useAppSelector(state => state.settings.hasTeamMembers)
    const name = useAppSelector(state => state.settings.name)
    const teamMembers = useAppSelector(selectAllTeamMembers)
    const status = useAppSelector(state => state.settings.status)
    const error = useAppSelector(state => state.spottings.error)
    const teamMemberForm = useRef<HTMLFormElement>(null);

    const [hasTeam, setHasTeam] = useState(hasTeamMembers);
    const [newName, setNewName] = useState(name);

    const [newTeamMemberName, setNewTeamMemberName] = useState('')
    const [newTeamMemberColor, setNewTeamMemberColor] = useState("#000000")

    useEffect(() => {
        setNewName(name)
    }, [name])

    const onChangeNewName = (event: any) => {
        setNewName(event.target.value)
    }

    const onChangeNewTeamMemberName = (event: any) => {
        setNewTeamMemberName(event.target.value)
    }

    const onChangeNewTeamMemberColor = (event: any) => {
        setNewTeamMemberColor(event.target.value)
    }

    const onSubmitTeamMember = (event: any) => {
        event.preventDefault()
        if (!newTeamMemberName) return;
        addTeamMember()
        if (teamMemberForm && teamMemberForm.current)
            teamMemberForm.current.reset()
    }

    const onSubmitName = (event: any) => {
        event.preventDefault()
        dispatch(setName({ name: newName, id: session?.user.id + '', database: supabase }))
    }

    async function addTeamMember() {
        dispatch(addNewTeamMember(
            {
                teamMember:
                {
                    name: newTeamMemberName, color: newTeamMemberColor, profile: session?.user.id, id: undefined
                },
                supabase: supabase
            }
        ));
    }

    function toggleHasTeam(e: any) {
        setHasTeam(e.target.checked);
        dispatch(setHasTeamMembers({ hasTeamMembers: e.target.checked, id: session?.user.id + '', database: supabase }))
    }

    function teamMembersList() {
        return <ul className="mb-8">
            {teamMembers && teamMembers.map(member => { return <li className="flex gap-2 my-2" key={member.name}><MemberBadge name={member.name} color={member.color} profile={member.profile} id={undefined} />{member.name}</li> })}
        </ul>
    }

    return (
        <div className="flex flex-col gap-8">
            <PageTemplate>
                <Typography variant="h2" gutterBottom>
                    Inställningar
                </Typography >
                <FormGroup>
                    <FormControlLabel control={<Switch
                        checked={hasTeam}
                        onChange={toggleHasTeam}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />} label="Slå på teamfunktionalitet" />
                </FormGroup>
                <form onSubmit={onSubmitName} className="flex flex-col gap-8 py-8">
                    <TextField id="name" defaultValue={name} onChange={onChangeNewName} label={hasTeam ? 'Teamets namn' : 'Mitt namn'} variant="outlined" />
                    <button type="submit" className="btn-primary">Spara namn</button>
                </form>
                {
                    hasTeam && <section>
                        <Typography variant="h2" gutterBottom>
                            Teammedlemmar
                        </Typography >
                        {teamMembersList()}
                        <Typography variant="h2" gutterBottom>
                            Lägg till ny teammedlem
                        </Typography >
                        <form onSubmit={onSubmitTeamMember} ref={teamMemberForm} className="flex flex-col gap-8">
                            <TextField id="newTeamMemberName" defaultValue={newTeamMemberName} onChange={onChangeNewTeamMemberName} label="Teammedlemmens namn" variant="outlined" />
                            <div>
                                <label htmlFor="newTeamMemberColor">Teammedlemmens favoritfärg</label><br />
                                <input type="color" name="newTeamMemberColor" onChange={onChangeNewTeamMemberColor} />
                            </div>
                            <button type="submit" className="btn-primary">Lägg till teammedlem</button>
                        </form>
                    </section>
                }
            </PageTemplate >
        </div >
    )
}
export default Settings