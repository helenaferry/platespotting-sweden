import type { NextPage } from 'next'
import React, { useState } from 'react';
import PageTemplate from "./../components/page-template/PageTemplate"
import MemberBadge from './../components/member-badge/MemberBadge'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAppSelector, useAppDispatch } from './../hooks'
import { selectAllTeamMembers, setHasTeamMembers } from './../store/teamMemberSlice'

const Settings: NextPage = () => {
    const supabase = useSupabaseClient()
    const session = useSession()
    const dispatch = useAppDispatch()
    const hasTeamMembers = useAppSelector(state => state.teamMembers.hasTeamMembers)
    const name = useAppSelector(state => state.teamMembers.name)
    const teamMembers = useAppSelector(selectAllTeamMembers)

    const [hasTeam, setHasTeam] = useState(hasTeamMembers);

    const [newTeamMemberName, setNewTeamMemberName] = useState('')
    const [newTeamMemberColor, setNewTeamMemberColor] = useState("#000000")

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
        const { data, error } = await supabase
            .from('teamMembers')
            .insert(
                { name: newTeamMemberName, color: newTeamMemberColor, profile: session?.user.id }
            )
        if (error) {
            console.log(error)
        }
    }

    function toggleHasTeam(e: any) {
        setHasTeam(e.target.checked);
        dispatch(setHasTeamMembers({ hasTeamMembers: e.target.checked, id: session?.user.id + '', supabase: supabase }))
    }

    function teamMembersList() {
        return <ul>
            {teamMembers.map(member => <li key={member.id}><MemberBadge id={member.id} name={member.name} color={member.color} />{member.name}</li>)}
        </ul>
    }

    return (
        <div>
            <PageTemplate>{hasTeamMembers}
                <label htmlFor="name">{hasTeam ? 'Teamets namn' : 'Mitt namn'}</label>
                <input id="name" type="name" value={name} className="border block mb-4"></input>
                <br/>
                <input type="checkbox" onClick={toggleHasTeam} defaultChecked={hasTeamMembers} />Vi är ett team som letar tillsammans
                {hasTeam && <section>
                    <h2>Teammedlemmar</h2>
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