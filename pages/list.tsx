import type { NextPage } from 'next'
import PageTemplate from "./../components/page-template/PageTemplate"
import Plate from './../components/plate/Plate'
import { useAppSelector, useAppDispatch } from './../hooks'
import { fetchSpottings, selectAllSpottings, selectNextPlate } from '../store/spottingsSlice'


const List: NextPage = () => {
  const dispatch = useAppDispatch()
  const spottings = useAppSelector(selectAllSpottings)
  const status = useAppSelector(state => state.spottings.status)

  if (status === 'idle') {
    dispatch(fetchSpottings())
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