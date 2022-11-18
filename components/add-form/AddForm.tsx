
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useState } from 'react';
import { useRouter } from 'next/router'
import Plate from './../plate/Plate'
import { LocationType } from './../../types/LocationType'
import { useAppSelector, useAppDispatch } from './../../hooks'
import { selectNextPlate, addNewSpotting } from './../../store/spottingsSlice'
import { selectAllTeamMembers } from './../../store/teamMemberSlice'

import dynamic from "next/dynamic"
import { TeamMemberType } from '../../types/TeamMemberType';

const LocationSelectorMap = dynamic(() => import("./../location-selector-map/LocationSelectorMap.js"), { ssr: false })


const AddForm: React.FunctionComponent = () => {
    const session = useSession()
    const router = useRouter()
    const todayString = getTodayString()
    const teamMembers = useAppSelector(selectAllTeamMembers)
    const [note, setNote] = useState("")
    const [date, setDate] = useState(todayString)
    const [membersSeen, setMembersSeen] = useState<(TeamMemberType | undefined)[]>([])
    const [location_lat, setLat] = useState(0)
    const [location_lng, setLng] = useState(0)
    const dispatch = useAppDispatch()
    const nextPlate = useAppSelector(selectNextPlate)
    const status = useAppSelector(state => state.spottings.status)
    const supabase = useSupabaseClient()
    const [addSpottingStatus, setAddSpottingStatus] = useState('idle')


    const onChangeNote = (event: any) => {
        setNote(event.target.value)
    }

    const onChangeDate = (event: any) => {
        setDate(event.target.value);
    }

    const onChangeMembersSeen = () => {
        setMembersSeen(Array.from(
            document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
            .filter(checkbox => checkbox.checked)
            .map(checkbox => teamMembers.find(tm => tm.id == checkbox.value)));
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

    const canSave = addSpottingStatus === 'idle';

    async function addSpotting() {
        if (canSave) {
            setAddSpottingStatus('pending')
            await dispatch(addNewSpotting({
                spotting: { plateNumber: nextPlate, dateSpotted: date, note: note, profile: session?.user.id, location_lat: location_lat, location_lng: location_lng, spottingTeamMembers: undefined },
                membersSeen: membersSeen,
                database: supabase
            }))
            router.push('/list')
            setAddSpottingStatus('idle')
        }
    }

    function updateLocationHandler(data: LocationType) {
        setLat(data.lat);
        setLng(data.lng);
    }

    const teamMembersSection = () => {
        return <section><p>Vilka lagmedlemmar såg?</p>
            {teamMembers.map(teamMember =>
                <div key={teamMember.id}>
                    <input name="membersSeen" type="checkbox" value={teamMember.id} id={teamMember.id}
                        onChange={onChangeMembersSeen} />
                    <label htmlFor={teamMember.name}>{teamMember.name}</label></div>)}</section>
    }

    return (status == 'succeeded' && addSpottingStatus == 'idle' ?
        <form onSubmit={onSubmit} className="flex flex-col">
            <Plate plateNumber={nextPlate} />
            <label htmlFor="date">Datum</label>
            <input type="date" name="date" onChange={onChangeDate} value={todayString} className="border block mb-4" />
            <LocationSelectorMap updateLocation={updateLocationHandler} />
            <label htmlFor="lat">Latitud</label>
            <input name="lat" type="text" value={location_lat} readOnly className="border block mb-4"></input>
            <label htmlFor="lng">Longitud</label>
            <input name="lng" type="text" value={location_lng} readOnly className="border block mb-4"></input>
            <label htmlFor="note">Anteckning</label>
            <textarea name="note" onChange={onChangeNote} className="border block mb-4" />
            {teamMembers.length > 0 && teamMembersSection()}
            <button type="submit" className="btn-primary" disabled={!canSave}>
                Spara
            </button>
        </form>
        : status == 'failed' ? <p>Något gick fel</p> : <p>Laddar...</p>
    )
}
export default AddForm;