import type { NextPage } from 'next'
import React, { useState } from 'react';
import PageTemplate from "./../components/page-template/PageTemplate"
import MemberBadge from './../components/member-badge/MemberBadge'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAppSelector } from './../hooks'
import { selectAllTeamMembers } from './../store/teamMemberSlice'

const Settings: NextPage = () => {
    const supabase = useSupabaseClient()
    const session = useSession()

    const teamMembers = useAppSelector(selectAllTeamMembers)

    const [hasTeam, setHasTeam] = useState(false);

    const [name, setName] = useState("")
    const [color, setColor] = useState("#000000")

    const onChangeName = (event: any) => {
        setName(event.target.value)
    }

    const onChangeColor = (event: any) => {
        setColor(event.target.value)
    }

    const onSubmit = (event: any) => {
        event.preventDefault()
        addTeamMember()
    }

    async function addTeamMember() {
        const { data, error } = await supabase
            .from('teamMembers')
            .insert(
                { name: name, color: color, profile: session?.user.id }
            )
        if (error) {
            console.log(error)
        }
    }

    function toggleHasTeam(e: any) {
        setHasTeam(e.target.checked);
    }

    function teamMembersList() {
        return <ul>
            {teamMembers.map(member => <li key={member.id}>{member.name}<MemberBadge id={member.id} name={member.name} color={member.color}/></li>)}
        </ul>
    }

    return (
        <div>
            <PageTemplate>
                <input type="checkbox" onClick={toggleHasTeam} />Vi är ett team som letar tillsammans {hasTeam}
                {hasTeam && <section>
                <h2>Teammedlemmar</h2>
                {teamMembersList()}
                <h2>Lägg till teammedlem</h2>
                <form onSubmit={onSubmit} className="flex flex-col">
                    <label htmlFor="note">Namn</label>
                    <input name="name" onChange={onChangeName} className="border block mb-4" />
                    <label htmlFor="color">Färg</label>
                    <input type="color" name="color" onChange={onChangeColor} />
                    <button type="submit" className="btn-primary">Lägg till</button>
                </form>
                </section> }
            </PageTemplate>
        </div>
    )
}
export default Settings