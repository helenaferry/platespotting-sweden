
import { SpottingType } from './../../types/SpottingType'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import Plate from './../plate/Plate'
import { useAppSelector, useAppDispatch } from './../../hooks'
// import { useDispatch, useSelector } from 'react-redux'
import { fetchSpottings, selectAllSpottings, selectNextPlate, addNewSpotting } from './../../store/spottingsSlice'

// const AddForm: React.FunctionComponent = () => {
const AddForm = () => {
    const session = useSession()
    //const router = useRouter()
    const todayString = getTodayString()
    const [note, setNote] = useState("")
    const [date, setDate] = useState(todayString)
    const dispatch = useAppDispatch()
    // const dispatch = useDispatch()
    // const error = useAppSelector(state => state.spottings.error)
    // const spottings = useAppSelector(selectAllSpottings)
    const nextPlate = useAppSelector(selectNextPlate)
    // const status = useAppSelector(state => state.spottings.status)
    // const supabase = useSupabaseClient()
    const [addSpottingStatus, setAddSpottingStatus] = useState('idle')

    if (status === 'idle') {
        dispatch(fetchSpottings())
    }

    const onChangeNote = (event: any) => {
        setNote(event.target.value)
    }

    const onChangeDate = (event: any) => {
        setDate(event.target.value);
    }

    const onSubmit = (event: any) => {
        event.preventDefault()
        addSpotting();
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

    const canSave = addSpottingStatus === 'idle';
    // [plateNumber: nextPlate(), dateSpotted, note, email].every(Boolean) && addSpottingStatus === 'idle'

    const addSpotting = async () => {
        if (canSave) {
            console.log('allowed to save and will try?')
            try {
                setAddSpottingStatus('pending')
                await dispatch(addNewSpotting({ plateNumber: nextPlate, dateSpotted: date, note: note, email: session?.user.email })).unwrap()
            } catch (err) {
                console.error('Failed to save the spotting: ', err)
            } finally {
                setAddSpottingStatus('idle')
                // router.push('/list')
            }
        }
    }
    /*
const { data, error } = await supabase
.from('spottings')
.insert(
    { plateNumber: nextPlate, dateSpotted: date, note: note, email: session?.user.email }
)
if (!error) {
dispatch(fetchSpottings())
router.push('/list')
} else {
console.log(error)
}*/


    return (
        <form onSubmit={onSubmit} className="flex flex-col">
            <p>OBS! Funkar inte för tillfället :)</p>
            <Plate plateNumber={nextPlate} />
            <label htmlFor="date">Datum</label>
            <input type="date" name="date" onChange={onChangeDate} value={todayString} className="border block mb-4" />
            <label htmlFor="note">Anteckning</label>
            <textarea name="note" onChange={onChangeNote} className="border block mb-4" />
            <button type="submit" className="btn-primary" disabled={!canSave}>
                Spara
            </button>
        </form>
    )
}
export default AddForm;