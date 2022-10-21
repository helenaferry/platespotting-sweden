
import { SpottingType } from './../../types/SpottingType'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useState } from 'react';
import { useRouter } from 'next/router'
const AddForm: React.FunctionComponent = () => {
    const session = useSession()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const todayString = getTodayString();
    const [note, setNote] = useState("")
    const [plateNumber, setPlateNumber] = useState("")
    const [date, setDate] = useState(todayString)

    const onChangeNote = (event: any) => {
        setNote(event.target.value)
    }

    const onChangePlateNumber = (event: any) => {
        setPlateNumber(event.target.value)
    }

    const onChangeDate = (event: any) => {
        setDate(event.target.value);
    }

    const onSubmit = (event: any) => {
        event.preventDefault()
        addSpotting()
    }

    function getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const monthString = (month < 10) ? '0' + month : month;
        const dayString = (day < 10) ? '0' + day : day;
        return year + '-' + monthString + '-' + dayString;
    }

    async function addSpotting() {
        const { data, error } = await supabase
            .from('spottings')
            .insert(
                { plateNumber: plateNumber, dateSpotted: date, note: note, email: session?.user.email }
            )       
        if (!error) {
            console.log('joråsåatteh')
            router.push('/list')
        } else {
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col">
            <label htmlFor="plateNumber">Nummer</label>
            <input type="text" name="plateNumber" onChange={onChangePlateNumber} className="border block mb-4" />
            <label htmlFor="date">Datum</label>
            <input type="date" name="date" onChange={onChangeDate} value={todayString} className="border block mb-4" />
            <label htmlFor="note">Anteckning</label>
            <textarea name="note" onChange={onChangeNote} className="border block mb-4" />
            <button type="submit" className="btn-primary">
                Spara
            </button>
        </form>
    )
}
export default AddForm;