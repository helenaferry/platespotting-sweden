import type { NextPage } from 'next'
import { useEffect, useState } from "react";
import PageTemplate from "./../components/page-template/PageTemplate"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { SpottingType } from './../types/SpottingType'
import Plate from './../components/plate/Plate'

const List: NextPage = () => {
    const session = useSession()
    const supabase = useSupabaseClient()
    let [spottings, setSpottings] = useState<SpottingType[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            console.log('fetchData')
            let { data: spottings, error } = await supabase
                .from('spottings')
                .select('*')
            let s = spottings as SpottingType[];
            setSpottings(s);
            console.log(spottings)
        }
        fetchData()
            .catch(console.error);
    }, [supabase]);

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