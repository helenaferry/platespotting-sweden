
import Plate from './../plate/Plate'
import { useAppSelector } from './../../hooks'
import { selectAllSpottings } from './../../store/spottingsSlice'
import MemberBadge from './../member-badge/MemberBadge'

const SpottingTable = () => {
  const spottings = useAppSelector(selectAllSpottings)
  const status = useAppSelector(state => state.spottings.status)

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">Nummerplåt</th>
          <th className="text-left">Datum</th>
          <th className="text-left">Teammedlemmar</th>
          <th className="text-left">Anteckning</th>
        </tr>
      </thead>
      <tbody>
        {
          spottings && spottings.map(function (spotting, index) {
            return <tr key={index} >
              <td className=""><Plate plateNumber={spotting.plateNumber}></Plate></td>
              <td className="">{spotting.dateSpotted}</td>
              <td className="">{spotting.spottingTeamMembers && spotting.spottingTeamMembers.map(tm => <MemberBadge key={tm.teamMembers.id} id={tm.teamMembers.id} name={tm.teamMembers.name} color={tm.teamMembers.color} />)}</td>
              <td className="">{spotting.note}</td>
            </tr>
          })
        }
      </tbody>
    </table>)
}

export default SpottingTable