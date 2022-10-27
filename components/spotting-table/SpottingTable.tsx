
import Plate from './../plate/Plate'
import { useAppSelector } from './../../hooks'
import { selectAllSpottings } from './../../store/spottingsSlice'

const SpottingTable = () => {
  const spottings = useAppSelector(selectAllSpottings)
  const status = useAppSelector(state => state.spottings.status)

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Nummerplåt</th>
          <th>Datum</th>
          <th>Anteckning</th>
        </tr>
      </thead>
      <tbody>
        {
          spottings && spottings.map(function (spotting, index) {
            return <tr key={index} >
              <td className=""><Plate plateNumber={spotting.plateNumber}></Plate></td>
              <td className="">{spotting.dateSpotted}</td>
              <td className="">{spotting.note}</td>
            </tr>
          })
        }
      </tbody>
    </table>)
}

export default SpottingTable