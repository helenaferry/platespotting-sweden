import type { NextPage } from 'next'
import { SpottingType } from './../types/SpottingType'
import { useEffect, useState } from "react";
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Plate from './../components/plate/Plate'

const List: NextPage = () => {
    const session = useSession()
    const supabase = useSupabaseClient()
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
        let latest = spottings && spottings.reduce((x, y) => x > y ? x : y, { plateNumber: '000' })
        if (latest && latest.plateNumber != '000') {
            let number = parseInt(latest.plateNumber);
            return String(number + 1).padStart(3, '0');
        } else {
            return '001';
        }
    }

    return (
        <PageTemplate>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Nummerplåt</th>
                            <th>Datum</th>
                            <th>Anteckning</th>
                            <th>Användare</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            spottings && spottings.map(function (spotting, index) {
                                return <tr key={index}>
                                    <td><Plate plateNumber={spotting.plateNumber}></Plate></td>
                                    <td>{spotting.dateSpotted}</td>
                                    <td>{spotting.note}</td>
                                    <td>{spotting.email}</td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
        </PageTemplate>
    )
}
export default List