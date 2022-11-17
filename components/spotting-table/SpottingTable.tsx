
import Plate from './../plate/Plate'
import { useAppSelector } from './../../hooks'
import { selectAllSpottings } from './../../store/spottingsSlice'
import MemberBadge from './../member-badge/MemberBadge'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AvatarGroup from '@mui/material/AvatarGroup';

const SpottingTable = () => {
  const spottings = useAppSelector(selectAllSpottings)
  const status = useAppSelector(state => state.spottings.status)
  const hasTeamMembers = useAppSelector(state => state.settings.hasTeamMembers)

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Nummerplåt</TableCell>
            <TableCell>Datum</TableCell>
            {hasTeamMembers && <TableCell align="right">Teammedlemmar</TableCell>}
            <TableCell>Anteckning</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spottings.map((spotting) => (
            <TableRow
              key={spotting.plateNumber}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell><Plate plateNumber={spotting.plateNumber}/></TableCell>
              <TableCell>{spotting.dateSpotted}</TableCell>
              {hasTeamMembers && <TableCell>
                <AvatarGroup max={5}>
                  {spotting.spottingTeamMembers && spotting.spottingTeamMembers.map(tm => 
                    <MemberBadge 
                      key={tm.teamMembers.id} 
                      id={tm.teamMembers.id} 
                      name={tm.teamMembers.name} 
                      color={tm.teamMembers.color} 
                      profile={undefined}/>
              )}
              </AvatarGroup>
              </TableCell>}
              <TableCell>{spotting.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    )
}

export default SpottingTable