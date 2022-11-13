import type { NextPage } from 'next'
import React, { useState } from 'react';
import PageTemplate from "./../components/page-template/PageTemplate"
import MemberBadge from './../components/member-badge/MemberBadge'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAppSelector, useAppDispatch } from './../hooks'
import { selectAllTeamMembers, addNewTeamMember } from './../store/teamMemberSlice'
import { setHasTeamMembers } from '../store/settingsSlice';

const Settings: NextPage = () => {
    const supabase = useSupabaseClient()
    const session = useSession()
    const dispatch = useAppDispatch()
    const hasTeamMembers = useAppSelector(state => state.settings.hasTeamMembers)
    const name = useAppSelector(state => state.settings.name)
    const teamMembers = useAppSelector(selectAllTeamMembers)
    const status = useAppSelector(state => state.settings.status)
    const error = useAppSelector(state => state.spottings.error)

    const [hasTeam, setHasTeam] = useState(hasTeamMembers);

    const [newTeamMemberName, setNewTeamMemberName] = useState('')
    const [newTeamMemberColor, setNewTeamMemberColor] = useState("#000000")

    const onChangeName = (event: any) => {
        console.log('name to be ' + event.target.value);
    }

    const onChangeNewTeamMemberName = (event: any) => {
        setNewTeamMemberName(event.target.value)
    }

    const onChangeNewTeamMemberColor = (event: any) => {
        setNewTeamMemberColor(event.target.value)
    }

    const onSubmit = (event: any) => {
        event.preventDefault()
        addTeamMember()
    }

    async function addTeamMember() {
        dispatch(addNewTeamMember(
            {
                teamMember:
                {
                    name: newTeamMemberName, color: newTeamMemberColor, profile: session?.user.id
                },
                supabase: supabase
            }
        ));
    }

    function toggleHasTeam(e: any) {
        setHasTeam(e.target.checked);
        dispatch(setHasTeamMembers({ hasTeamMembers: e.target.checked, id: session?.user.id + '', supabase: supabase }))
    }

    function teamMembersList() {
        return <ul>
            {teamMembers && teamMembers.map(member => { return <li key={member.name}><MemberBadge name={member.name} color={member.color} profile={member.profile} />{member.name}</li> })}
        </ul>
    }

    return (
        <div>
            <PageTemplate>{hasTeamMembers}
                <label htmlFor="name">{hasTeam ? 'Teamets namn' : 'Mitt namn'}</label>
                <input id="name" type="name" value={name || ''} onChange={onChangeName} className="border block mb-4"></input>
                <br />
                <input type="checkbox" onClick={toggleHasTeam} defaultChecked={hasTeamMembers} />Vi är ett team som letar tillsammans
                {hasTeam && <section>
                    <h2>Teammedlemmar</h2>
                    <p>{status}</p>
                    <p>{error}</p>
                    {teamMembersList()}
                    <h2>Ny teammedlem</h2>
                    <form onSubmit={onSubmit} className="flex flex-col">
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