
import { SpottingType } from './../../types/SpottingType'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import Plate from './../plate/Plate'
const AddForm: React.FunctionComponent = () => {
    const session = useSession()
    const supabase = useSupabaseClient()
    const router = useRouter()
    const todayString = getTodayString();
    const [note, setNote] = useState("")
    const [date, setDate] = useState(todayString)
    let [spottings, setSpottings] = useState<SpottingType[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            let { data: spottings, error } = await supabase
                .from('spottings')
                .select('*')
            let s = spottings as SpottingType[];
            setSpottings(s);
        }
        fetchData()
            .catch(console.error);
    }, [supabase]);

  function nextPlate() {
    let latest = spottings && spottings.reduce((x, y) => x > y ? x : y, { plateNumber: '000'})
    if (latest && latest.plateNumber != '000') {
      let number = parseInt(latest.plateNumber);
      return String(number + 1).padStart(3, '0');
    } else {
      return '001';
    }
  }
    const onChangeNote = (event: any) => {
        setNote(event.target.value)
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
                { plateNumber: nextPlate(), dateSpotted: date, note: note, email: session?.user.email }
            )
        if (!error) {
            router.push('/list')
        } else {
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col">
            <Plate plateNumber={nextPlate()} />
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