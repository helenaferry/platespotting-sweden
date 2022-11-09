import type { NextPage } from 'next'
import React, { useState } from 'react';
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

const Settings: NextPage = () => {
    const supabase = useSupabaseClient()
    const session = useSession()

    const [name, setName] = useState("")
    const [color, setColor] = useState("")

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
    return (
        <div>
            <PageTemplate>
                <p>Lägg till teammedlem</p>
                <form onSubmit={onSubmit} className="flex flex-col">
                    <label htmlFor="note">Namn</label>
                    <input name="name" onChange={onChangeName} className="border block mb-4" />
                    <label htmlFor="color">Färg</label>
                    <input type="color" name="color" onChange={onChangeColor} />
                    <button type="submit" className="btn-primary">Lägg till</button>
                </form>
            </PageTemplate>
        </div>
    )
}
export default Settings