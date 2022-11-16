import type { NextPage } from 'next'
import React, { useState, useEffect, useRef } from 'react';
import PageTemplate from "./../components/page-template/PageTemplate"
import MemberBadge from './../components/member-badge/MemberBadge'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAppSelector, useAppDispatch } from './../hooks'
import { selectAllTeamMembers, addNewTeamMember } from './../store/teamMemberSlice'
import { setHasTeamMembers, setName } from '../store/settingsSlice';

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
        return <ul>
            {teamMembers && teamMembers.map(member => { return <li key={member.name}><MemberBadge name={member.name} color={member.color} profile={member.profile} id={undefined} />{member.name}</li> })}
        </ul>
    }

    return (
        <div>
            <PageTemplate>
                <h2>Inställningar</h2>
                <p>
                    <input type="checkbox" onClick={toggleHasTeam} defaultChecked={hasTeamMembers} />Vi är ett team som letar tillsammans
                </p>
                <label htmlFor="name">{hasTeam ? 'Teamets namn' : 'Mitt namn'}</label>
                <form onSubmit={onSubmitName}>
                    <input id="name" type="text" defaultValue={name} onChange={onChangeNewName} className="border block mb-4"></input>
                    <button type="submit" className="btn-primary">Spara namn</button>
                </form>
                {hasTeam && <section>
                    <h2>Teammedlemmar</h2>
                    {teamMembersList()}
                    <h2>Ny teammedlem</h2>
                    <form onSubmit={onSubmitTeamMember}  ref={teamMemberForm} className="flex flex-col">
                        <label htmlFor="newTeamMemberName">Teammedlemmens namn</label>
                        <input name="newTeamMemberName" onChange={onChangeNewTeamMemberName} className="border block mb-4" />
                        <label htmlFor="newTeamMemberColor">Teammedlemmens favoritfärg</label>
                        <input type="color" name="newTeamMemberColor" onChange={onChangeNewTeamMemberColor} />
                        <button type="submit" className="btn-primary">Lägg till teammedlem</button>
                    </form>
                </section>}
            </PageTemplate>
        </div>
    )
}
export default Settings