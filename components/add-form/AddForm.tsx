
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

import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

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
            .map(checkbox => teamMembers.find(tm => tm.id == parseInt(checkbox.value))));
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
                spotting: { plateNumber: nextPlate, dateSpotted: date, note: note, profile: session?.user.id, location_lat: location_lat, location_lng: location_lng, spottingTeamMembers: undefined, id: undefined },
                membersSeen: membersSeen,
                database: supabase
            }))
            // router.push('/list')
            // router.reload()
            setAddSpottingStatus('idle')
            setNote('')
        }
    }

    function updateLocationHandler(data: LocationType) {
        setLat(data.lat);
        setLng(data.lng);
    }

    const teamMembersSection = () => {
        return <section>
            <FormControl sx={{ m: 3 }} variant="standard">
                <FormLabel>Vilka teammedlemmar såg den?</FormLabel>
                <FormGroup row>
                    {teamMembers.map(teamMember =>
                        <FormControlLabel key={teamMember.id}
                            control={
                                <Checkbox value={teamMember.id} onChange={onChangeMembersSeen} name="membersSeen" />
                            }
                            label={teamMember.name}
                        />
                    )}
                </FormGroup>
            </FormControl>
        </section>
    }

    return (status == 'succeeded' && addSpottingStatus == 'idle' ?
        <form onSubmit={onSubmit} className="flex flex-col gap-8">
            <div className="text-center">
                <p>Lägg till observation för:</p>
                <Plate plateNumber={nextPlate} large={true} />
            </div>
            TODO: type="date" again
            <TextField type="text" id="date" defaultValue={todayString} onChange={onChangeDate} label="Datum" variant="outlined" />
            <div>
                <p>Var såg du nummerplåten?<br /><small>Välj position på kartan. Sök fram rätt plats om kartan visar fel. Du kan flytta markören för att finjustera.</small></p>
                <LocationSelectorMap updateLocation={updateLocationHandler} /></div>
            <div className="flex gap-8">
                <TextField className='flex-1' value={location_lat} label="Latitud" variant="outlined" disabled helperText="Uppdateras automatiskt när du väljer kartposition" />
                <TextField className='flex-1' value={location_lng} label="Longitud" variant="outlined" disabled />
            </div>
            <TextField id="note" onChange={onChangeNote} label="Anteckning" variant="outlined" multiline minRows={3} />

            {teamMembers.length > 0 && teamMembersSection()}
            <button type="submit" className="btn-primary" disabled={!canSave}>
                Spara
            </button>
        </form>
        : status == 'failed' ? <p>Något gick fel</p> : <p>Laddar...</p>
    )
}
export default AddForm;